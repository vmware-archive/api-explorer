import { Component } from "@angular/core";
import { apixConfig } from '../apix.config';

@Component({
    selector: "apix-demo",
    styleUrls: [],
    template: `
    <!--<api-list></api-list>-->

    <!-- vCenter Demo -->
    <api-list
        [baseRoute] = "baseRoute"
        [enableLocal] ="true"
        [enableRemote]= "true"
        [localApiUrl]="localApiUrl"
        [remoteApiUrl]="remoteApiUrl"
        [remoteSampleExchangeUrl]="remoteSampleExchangeUrl"
        [hideFilters]="hideFilters"
        [apiListHeaderText]="'vCenter API Explorer'"
        [defaultProductsFilter]="defaultProductsFilter"
        [defaultSourcesFilter]="defaultSourcesFilter">

    </api-list>

    `
})

export class ApixDemo {
    // vCenter
    private baseRoute: string = apixConfig.baseRoute;
    private localApiUrl: string = apixConfig.localApiUrl;
    private remoteApiUrl: string = apixConfig.remoteApiUrl;
    private remoteSampleExchangeUrl: string = apixConfig.remoteSampleExchangeUrl;
    private apiListHeaderText: string = apixConfig.apiListHeaderText;
    private hideFilters: boolean = apixConfig.hideFilters;
    private defaultKeywordsFilter: string = apixConfig.defaultKeywordsFilter;
    private defaultProductsFilter: any[] = apixConfig.defaultProductsFilter;
    private defaultLanguagesFilter: any[] = apixConfig.defaultLanguagesFilter;
    private defaultSourcesFilter: any[] = apixConfig.defaultSourcesFilter;

    constructor() {}
}