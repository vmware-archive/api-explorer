/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
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


