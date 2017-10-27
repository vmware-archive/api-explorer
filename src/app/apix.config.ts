/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
export const APP_TITLE = 'VMware API Explorer';

export const apixConfig = {
    baseRoute: "/", /* /apix/ */
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
            "authUrl": "http://mp-test-app1.eng.vmware.com:8080/api/v1"
        },
        {   "id": "vcenter_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vCenter SSO",
            "authUrl": "https://10.154.10.43/rest/com/vmware/cis/session"
        },
        {   "id": "vra_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vRealize Automation SSO",
            "authUrl": "http://localhost"
        }
        ]

  };