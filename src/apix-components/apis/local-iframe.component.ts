import { Component, ViewChild, ElementRef, Renderer, Input, OnInit, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ApixApiService } from '../apix-api.service';
import { Api } from '../apix.model';

@Component({
  selector: 'local-iframe',

  template: `
    <iframe #iframe width="100%" height="700" frameBorder="0" allowfullscreen></iframe>
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
    this.localIframe = 'apix-components/swagger-console.html?url=' + this.url;
    this.loadContent();
  }

  constructor(
    private renderer: Renderer,
    private apixApiService: ApixApiService
  ) {}

  ngOnInit() :void {
  }

  ngAfterViewInit() {
    //this.loadContent();
  }

  loadContent() {
    //console.log('load iframe content');
    if (this.localIframe) {
      this.loading += 1;

      this.apixApiService.getSwaggerConsoleHTML(this.localIframe).then(response => {
          this.loading -= 1;
          var content = response._body;
          var doc =  this.iframe.nativeElement.contentDocument;
          doc.open('text/html');
          doc.write(content);
          doc.close();

          // Add the queryString parameters of the original URL as a hash to the new iframe
          var split = this.localIframe.split("?");
          if (split.length > 1) {
            doc.location.hash = split[1];
          }
      }).catch(response => {
        this.errorMessage = response;
      });
    }
  }
}