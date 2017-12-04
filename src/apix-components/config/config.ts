/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
export const APP_TITLE = 'VMware API Explorer Component';

export const config = {
    base: "/",
    path: '',
    apiListHeaderText: "Available APIs",
    remoteApiUrl: 'https://vdc-repo.vmware.com/apix',
    remoteSampleExchangeUrl: 'https://apigw.vmware.com/sampleExchange/v1',
    localApiUrl: 'local.json',
    enableLocal: true,
    enableRemote: true,
    defaultKeywordsFilter: '',
    defaultProductsFilter: [],
    defaultLanguagesFilter: [],
    defaultSourcesFilter: [],
    hideFilters: false,
    hideProductsFilter: false,
    hideLanguagesFilter: false,
    hideSourcesFilter: false,
    sso: [
        {   "id": "basic",
            "swaggerAuthName": "BasicAuth",
            "displayName": "BasicAuth",
            "authUrl": "/api/v1"
        },
        {   "id": "vcenter_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vCenter SSO",
            "authUrl": "/api/v1"
        },
        {   "id": "vra_sso",
            "swaggerAuthName": "ApiKeyAuth",
            "displayName": "vRealize Automation SSO",
            "authUrl": "/api/v1"
        }
        ]

};
