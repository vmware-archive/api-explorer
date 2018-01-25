/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';

import { ClarityModule } from '@clr/angular';
import { ApixComponentsModule } from "../apix-components/apix-components.module";

import { AppConfig } from './app.config';
import { AppComponent } from './app.component';
import { ROUTING } from "./app.routing";
import { environment } from '../environments/environment';

export function initConfig(config: AppConfig){
    return () => config.load()
}

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,
        ROUTING,
        ClarityModule.forRoot(),
        ApixComponentsModule.forRoot({
            configFileUrl: "assets/apix-config.json"
        }),
    ],
    providers: [
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: initConfig, deps: [AppConfig], multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
