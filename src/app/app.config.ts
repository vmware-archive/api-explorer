/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

export const APP_TITLE = 'VMware API Explorer';

@Injectable()
export class AppConfig {
    private config: Object = null;

    constructor(private http: Http) {}

    public getConfig(key: any) {
        return this.config[key];
    }

    public load() {
        return new Promise((resolve, reject) => {
            this.http.get('./apix-config.json').map(res => res.json())
                .catch((error: any): any => {
                    console.log('could not load config file');
                    resolve(true);
                }).subscribe((responseData) => {
                    this.config = responseData;
                    resolve(true);
                });
        });
    }
}

    /*
    baseRoute: "/",
    apiListHeaderText: "Available APIs",
    remoteApiUrl: 'https://vdc-repo.vmware.com/apix',
    remoteSampleExchangeUrl: 'https://apigw.vmware.com/sampleExchange/v1',
    localApiUrl: 'local.json',
    enableLocal: false,
    enableRemote: true,
    defaultKeywordsFilter: '',
    defaultProductsFilter: [],
    defaultLanguagesFilter: [],
    defaultSourcesFilter: [],
    hideFilters: false,
    hideProductFilter: false,
    hideLanguageFilter: false,
    hideSourceFilter: false,
    sso: [
        {   "id": "basic",
            "swaggerAuthName": "BasicAuth",
            "displayName": "BasicAuth",
            "authUrl": "/api/v1"
        },
        {   "id": "vcenter_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vCenter SSO",
            "authUrl": "/rest/com/vmware/cis/session"
        },
        {   "id": "vra_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vRealize Automation SSO",
            "authUrl": "/api/v1"
        }
        ]

  };*/