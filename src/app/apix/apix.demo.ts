import { Component } from "@angular/core";

@Component({
    selector: "apix-demo",
    styleUrls: [],
    template: `
        <api-list
            [hideFilters]="true"
            [apiListHeaderText]="'vCenter API Explorer'"
            [defaultProductsFilter]="defaultProductsFilter">

        </api-list>
    `
})

export class ApixDemo {
    private defaultKeywordsFilter: string = '';
    private defaultProductsFilter: any[] = ['vSphere'];
    private defaultLanguagesFilter: any[] = [];
    private defaultSourcesFilter: any[] = [];

    private sso: any[] = [
        {   "id": "vcenter_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vCenter SSO",
            "authUrl": "http://mp-test-app1.eng.vmware.com:8080/api/v1"
        }
        ]

    constructor() {}
}