/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, ViewChild, ElementRef, Renderer, Input, OnInit, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ApixApiService } from './apix-api.service';
import { ApixConfigService } from '../config/config.service';
import { Api } from '../apix.model';

@Component({
  selector: 'local-iframe',

  template: `
    <iframe #iframe iframe-resize  width="100%" frameBorder="0" allowfullscreen></iframe>
  `,
  styles: [`
  `]
})

export class LocalIframeComponent implements AfterViewInit {
    @ViewChild('iframe') iframe;
    api: Api;
    url = null;
    localIframe = null;
    loading: number = 0;
    infoMessage: string = '';
    errorMessage: string = '';


  @Input() set src(value: string) {
    this.url = value;
    this.localIframe = 'assets/swagger-console.html?url=' + this.url;
    this.loadContent();
  }

  constructor(
    private renderer: Renderer,
    private apixApiService: ApixApiService,
    private configService: ApixConfigService
  ) {}

  ngOnInit() :void {
  }

  ngAfterViewInit() {

  }

  loadContent() {
    //console.log('window.location.pathname=' + window.location.pathname);
    //console.log('window.location.href=' + window.location.href);
    //console.log('this.localIframe=' + this.localIframe);
    if (this.localIframe) {
      var apixbase = this.configService.getConfigValue("base") || '/';

      this.loading++;
      this.apixApiService.getSwaggerConsoleHTML(this.localIframe).then(response => {
        this.loading--;
          var content = response._body;
          var doc =  this.iframe.nativeElement.contentDocument;
          doc.open('text/html');
          content = content.replace(/@@folder@@/g, apixbase);
          content = content.replace(/@@base@@/g, window.location.href);
          doc.write(content);
          doc.close();

          // Add the queryString parameters of the original URL as a hash to the new iframe
          var split = this.localIframe.split("?");
          if (split.length > 1) {
             //console.log('doc.location.hash=' + doc.location.hash);
             doc.location.hash = split[1];
          }
      }).catch(response => {
        this.loading--;
        this.errorMessage = response;
      });
    }
  }
}