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
        if (!Array.isArray(key)) {
            return this.config[key];
        }
        let res: any = this.config;
        key.forEach(k => res = res[k]);
        return res;
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
