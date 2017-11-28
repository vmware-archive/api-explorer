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

import { ClarityModule } from 'clarity-angular';
import { ApixComponentsModule } from "../apix-components/apix-components.module";

import { AppConfig } from './app.config';
import { AppComponent } from './app.component';
import { AppRoutingModule } from "./app.routing";
import { ApixListDemo } from './apix-list.demo';
import { ApixDetailsDemo } from './apix-details.demo';
import { environment } from '../environments/environment';

export function initConfig(config: AppConfig){
    return () => config.load()
}

@NgModule({
    declarations: [
        AppComponent,
        ApixListDemo,
        ApixDetailsDemo
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        ClarityModule.forRoot(),
        ApixComponentsModule.forRoot()
    ],
    providers: [
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: initConfig, deps: [AppConfig], multi: true }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
