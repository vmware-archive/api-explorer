/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

 /**
  * Api model class that reflects the values returned from the APIX services.
  */
export class Api {
    id: number;
    name: string;
    api_uid: string;
    version: string;
    description: string;
    productDisplayString: string;
    languages: any[];
    products: any[];
    source: string;
    type: string;
    url: string;
    apiGroup: string;
}

/**
 * Swagger API preferences class.
 */
export class ApiPreferences {
    host: string;
    basePath: string;
}

/**
 * ApiResources model class that reflects the values returned from the APIX services.
 */
export class ApiResources {
    docs: any[];
    sdks: any[];
    samples: any[];
}

/**
 * User model class.
 */
export class User {
    username: string;
    password: string;
    tenant: string;
}

/**
 * Auth model class.
 */
export class Auth {
    id: string;
    swaggerAuthName: string;
    displayName: string;
    authUrl: string;

    static fromJson(src: any) {
      var obj = new Auth();
      obj.id = src.id;
      obj.swaggerAuthName = src.swaggerAuthName;
      obj.displayName = src.displayName;
      obj.authUrl = src.authUrl;
      return obj;
    }
};

/**
 * Config class.
 */
export class Config {
    base: string;
    path: string;
    localApiUrl: string;
    remoteApiUrl: string;
    remoteSampleExchangeUrl: string;
    hideFilters: boolean;
    apiListHeaderText: string;
    hideProductsFilter: boolean;
    hideLanguagesFilter: boolean;
    hideSourcesFilter: boolean;
    defaultProductsFilter: any[];
    defaultLanguagesFilter: any[];
    defaultSourcesFilter: any[];
    defaultKeywordsFilter: string;
    enableLocal: boolean;
    enableRemote: boolean;

}
