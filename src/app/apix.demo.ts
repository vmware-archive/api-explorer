import { Component } from "@angular/core";
import { AppConfig } from './app.config';

@Component({
    selector: "apix-demo",
    styleUrls: [],
    template: `
    <!--<api-list></api-list>-->

    <!-- vCenter Demo -->
    <api-list
        [baseRoute] = "baseRoute"
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

export class ApixDemo {

    baseRoute: string = this.config.getConfig("baseRoute");
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