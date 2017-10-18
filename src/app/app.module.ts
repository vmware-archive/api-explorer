/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';

import { ClarityModule } from 'clarity-angular';
import { SelectModule } from 'ng-select';
import { PopoverModule } from 'ng2-pop-over';

import { AppComponent } from './app.component';
import { ROUTING } from "./app.routing";
import { ApiListComponent } from "./apis/api-list.component";
import { ApiDetailComponent } from "./apis/api-detail.component";
import { LocalIframeComponent } from "./apis/local-iframe.component";
import { LoginComponent } from './login/login.component';
import { AppUtils } from './app.utils';
import { ArraySortPipe } from './pipes/sort.pipe';
import { OrderByPipe } from './pipes/orderBy.pipe';
import { FilterTagPipe } from './pipes/filterTag.pipe';
import { SafePipe } from './pipes/safe.pipe';

import { AppService } from './app.service';
import { UserService } from './services/user.service';

import { ApixHttp } from './services/apix.http';

import { environment } from '../environments/environment';

export function getApixHttp(xhrBackend: XHRBackend, requestOptions: RequestOptions, injector: Injector) {
    return new ApixHttp(xhrBackend, requestOptions, injector);
}

@NgModule({
    declarations: [
        AppComponent,
        ApiListComponent,
        ApiDetailComponent,
        LocalIframeComponent,
        LoginComponent,
        ArraySortPipe,
        OrderByPipe,
        SafePipe,
        FilterTagPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ClarityModule.forRoot(),
        ROUTING,
        SelectModule,
        PopoverModule
    ],
    providers: [
        {
            provide: Http,
            useFactory: getApixHttp,
            deps: [XHRBackend, RequestOptions, Injector]
        },

        AppService, UserService, AppService],
    bootstrap: [AppComponent]
})

export class AppModule {
}
