/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from "@angular/core";
import { AppConfig } from './app.config';

@Component({
    selector: "apix-demo",
    styleUrls: [],
    template: `
    <!--<api-list></api-list>-->

    <!-- vCenter Demo -->
    <api-list
        [base] = "base"
        [path] = "path"
        [apiListHeaderText]="apiListHeaderText"
        [enableLocal] ="enableLocal"
        [enableRemote]= "enableRemote"
        [localApiUrl]="localApiUrl"
        [remoteApiUrl]="remoteApiUrl"
        [remoteSampleExchangeUrl]="remoteSampleExchangeUrl"
        [hideFilters]="hideFilters"
        [hideProductsFilter]="hideProductsFilter"
        [hideLanguagesFilter]="hideLanguagesFilter"
        [hideSourcesFilter]="hideSourcesFilter"
        [defaultKeywordsFilter]="defaultKeywordsFilter"
        [defaultProductsFilter]="defaultProductsFilter"
        [defaultLanguagesFilter]="defaultLanguagesFilter"
        [defaultSourcesFilter]="defaultSourcesFilter">

    </api-list>

    `
})

export class ApixListDemo {

    base: string = this.config.getConfig("base");
    path: string = this.config.getConfig("path");
    localApiUrl: string = this.config.getConfig("localApiUrl");
    remoteApiUrl: string = this.config.getConfig("remoteApiUrl");
    remoteSampleExchangeUrl: string = this.config.getConfig("remoteSampleExchangeUrl");
    apiListHeaderText: string = this.config.getConfig("apiListHeaderText");
    enableLocal: boolean = this.config.getConfig("enableLocal");
    enableRemote: boolean = this.config.getConfig("enableRemote");
    hideFilters: boolean = this.config.getConfig("hideFilters");
    hideProductsFilter: boolean = this.config.getConfig("hideProductsFilter");
    hideLanguagesFilter: boolean = this.config.getConfig("hideLanguagesFilter");
    hideSourcesFilter: boolean = this.config.getConfig("hideSourcesFilter");

    defaultFilters: any = this.config.getConfig("defaultFilters");
    defaultKeywordsFilter: string = this.defaultFilters.keywords;
    defaultProductsFilter: any[] = this.defaultFilters.products;
    defaultLanguagesFilter: any[] = this.defaultFilters.languages;
    defaultSourcesFilter: any[] = this.defaultFilters.sources;

    constructor(private config: AppConfig) {

    }
}