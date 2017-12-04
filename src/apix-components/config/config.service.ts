/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Injectable, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { ApixComponentsConfig } from "./config.component";
import { Config } from '../apix.model';

@Injectable()
export class ApixConfigService {
    ready: EventEmitter<boolean> = new EventEmitter<boolean>();
    isReady: boolean = false;
    private config: ApixComponentsConfig;
    private configJson: any = null;

    constructor(private providedConfig: ApixComponentsConfig, private http: Http) {
        this.config = providedConfig;
        this.loadConfig();
    }

    private loadConfig() {
        this.http.get(this.config.configFileUrl).subscribe(response => {
            this.configJson = response.json();
            this.ready.emit(true);
            this.isReady = true;
        });
    }

    public getConfigValue(key: any) {
        if (!Array.isArray(key)) {
            return this.configJson[key];
        }
        let res: any = this.configJson;
        key.forEach(k => res = res[k]);
        return res;
    }

    public getConfig() {
        return this.configJson;
    }
}
