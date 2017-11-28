/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from "@angular/core";
import { AppConfig } from './app.config';

@Component({
    selector: "apix-detail-demo",
    styleUrls: [],
    template: `
    <api-details
        [base] = "base"
        [path] = "path"
        [localApiUrl]="localApiUrl"
        [remoteApiUrl]="remoteApiUrl"
        [remoteSampleExchangeUrl]="remoteSampleExchangeUrl">
    </api-details>
    `
})

export class ApixDetailsDemo {
    base: string = this.config.getConfig("base");
    path: string = this.config.getConfig("path");
    localApiUrl: string = this.config.getConfig("localApiUrl");
    remoteApiUrl: string = this.config.getConfig("remoteApiUrl");
    remoteSampleExchangeUrl: string = this.config.getConfig("remoteSampleExchangeUrl");

    constructor(private config: AppConfig) {}
}