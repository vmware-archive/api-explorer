/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { RouterModule } from "@angular/router";
import { ClarityModule } from 'clarity-angular';
import { SelectModule } from 'ng-select';

import { ApiListComponent } from "./apis/api-list.component";
import { ApiDetailComponent } from "./apis/api-detail.component";
import { LocalIframeComponent } from "./apis/local-iframe.component";
import { LoginComponent } from './login/login.component';
import { ApixUtils } from './apix.utils';
import { ArraySortPipe } from './pipes/sort.pipe';
import { OrderByPipe } from './pipes/orderBy.pipe';
import { FilterTagPipe } from './pipes/filterTag.pipe';
import { SafePipe } from './pipes/safe.pipe';

import { ApixApiService } from './apix-api.service';
import { ApixHttp } from './apix.http';
import { ApixRoutingModule} from './apix.routing';

export function getApixHttp(xhrBackend: XHRBackend, requestOptions: RequestOptions, injector: Injector) {
    return new ApixHttp(xhrBackend, requestOptions, injector);
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        ClarityModule.forRoot(),
        SelectModule,
        ApixRoutingModule
    ],
    declarations: [
        ApiListComponent,
        ApiDetailComponent,
        LocalIframeComponent,
        LoginComponent,
        ArraySortPipe,
        OrderByPipe,
        SafePipe,
        FilterTagPipe
    ],
    exports: [
        ApiListComponent,
        ApiDetailComponent,
        LocalIframeComponent,
        LoginComponent,
        ArraySortPipe,
        OrderByPipe,
        SafePipe,
        FilterTagPipe
    ],
    providers: [
        {
            provide: Http,
            useFactory: getApixHttp,
            deps: [XHRBackend, RequestOptions, Injector]
        },

        ApixApiService]
})

export class ApixComponentsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ApixComponentsModule,
            providers: [
                ApixApiService

            ]
        };
    }

    static forChild(): ModuleWithProviders {
        return {
            ngModule: ApixComponentsModule,
        };
    }
}