/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';

import { APP_TITLE } from './apix.config';
import { apixConfig } from './apix.config';

@Component({
    selector: 'my-app',
    moduleId: module.id,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    webappVersion: string = '';

    private apixAuth: any[] = apixConfig.sso;

    constructor(public router: Router, private route: ActivatedRoute, private title : Title) {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(event => {
                let route: ActivatedRoute = this.route;
                while (route.firstChild) route = route.firstChild;
                if (route.outlet === 'primary') {
                    let title = route.snapshot.data['title'];
                    if (route.snapshot.params['id'])
                        title += ` - ${route.snapshot.params['id']}`;
                    title += ` - ${APP_TITLE}`;
                    this.title.setTitle(title);
                }
            });
    }
}
