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

import { AppComponent } from './app.component';
import { AppRoutingModule } from "./app.routing";

import { ApixComponentsModule } from "../apix-components/apix-components.module";

import { environment } from '../environments/environment';

@NgModule({
    declarations: [
        AppComponent

    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        ClarityModule.forRoot(),
        ApixComponentsModule.forRoot()
    ],

    bootstrap: [AppComponent]
})

export class AppModule {}
