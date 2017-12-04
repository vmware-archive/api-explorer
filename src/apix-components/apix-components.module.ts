/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { RouterModule } from "@angular/router";
import { ClarityModule } from 'clarity-angular';

import { APIS_DIRECTIVES } from "./apis/index";
import { LOGIN_DIRECTIVES } from './login/index';
import { PIPES_DIRECTIVES } from './pipes/index';
import { ApixApiService } from './apis/apix-api.service';
import { ApixAuthService } from './login/apix-auth.service';
import { ApixHttp } from './apix.http';
import { ApixRoutingModule} from './apix.routing';

import { ApixComponentsConfig } from "./config/config.component";
import { ApixConfigService } from './config/config.service';

export function getApixHttp(xhrBackend: XHRBackend, requestOptions: RequestOptions, injector: Injector) {
    return new ApixHttp(xhrBackend, requestOptions, injector);
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        ClarityModule.forRoot(),
        ApixRoutingModule
    ],
    declarations: [
        APIS_DIRECTIVES,
        LOGIN_DIRECTIVES,
        PIPES_DIRECTIVES,
    ],
    exports: [
        APIS_DIRECTIVES,
        LOGIN_DIRECTIVES,
        PIPES_DIRECTIVES
    ],
    providers: [
        {
            provide: Http,
            useFactory: getApixHttp,
            deps: [XHRBackend, RequestOptions, Injector]
        },
        ApixApiService, ApixAuthService]
})

export class ApixComponentsModule {
    static forRoot(config: ApixComponentsConfig = {}): ModuleWithProviders {
        return {
            ngModule: ApixComponentsModule,
            providers: [
                ApixConfigService,
                { provide: ApixComponentsConfig, useValue: config }
            ]
        };
    }

    static forChild(): ModuleWithProviders {
        return {
            ngModule: ApixComponentsModule,
        };
    }
}
