/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
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

export class ApiPreferences {
    host: string;
    basePath: string;
}

export class ApiResources {
    docs: any[];
    sdks: any[];
    samples: any[];
}

export class User {
    username: string;
    password: string;
    tenant: string;
}

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



