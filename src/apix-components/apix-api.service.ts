/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Inject, Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { ApixUtils } from './apix.utils';
import { Auth, Config } from './apix.model';
import { config } from './apix.config';

@Injectable()
export class ApixApiService {

    public CONFIG_KEY = "apix-config";
    public APIX_BASE = "apix-base";
    public APIX_PATH = "apix-path";

    private base = null;
    private path = null;
    private remoteApiUrl = config.remoteApiUrl;
    private localApiUrl = config.localApiUrl;
    private remoteSXApiUrl = config.remoteSampleExchangeUrl;

    constructor(private http: Http, private router: Router) {
        /*
        if (!this.remoteApiUrl) {
            let configStored = localStorage.getItem(this.CONFIG_KEY);
            if (configStored) {
                let config = JSON.parse(configStored);
                this.base = config.baseUrl;
                this.path = config.routePath;
                this.remoteApiUrl = config.remoteApiUrl;
                this.localApiUrl = config.localApiurl;
                this.remoteSXApiUrl = config.remoteSXApiUrl;
            }
        }*/
    }

    setConfig (config: Config) {
        this.base = config.base;
        this.path = config.path;
        this.remoteApiUrl = config.remoteApiUrl;
        this.localApiUrl = config.localApiUrl;
        this.remoteSXApiUrl = config.remoteSampleExchangeUrl;
    }

    getBase() {
        return this.base;
    }

    getPath() {
        return this.path;
    }

    getRemoteApis() {
        return this.http.get(`${this.remoteApiUrl}/apis`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getLocalApis() {
        return this.http.get(`${this.localApiUrl}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getRemoteApi(id: number) {
        return this.http.get(`${this.remoteApiUrl}/apis/${id}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getLatestRemoteApiIdForApiUid (api_uid: string) {
        return this.http.get(`${this.remoteApiUrl}/apis/uids/${api_uid}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);

    }

    getRemoteApiResources (apiId: number) {
        return this.http.get(`${this.remoteApiUrl}/apis/${apiId}/resources`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getHTMLResponse (url: string) {
        return this.http.get(`${url}`)
            .toPromise()
            .then(response => response)
            .catch(this.handleError);
    }

    getJSONResponse (url: string) {
        return this.http.get(`${url}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getSwaggerConsoleHTML (url: string) {
        return this.http.get(`${url}`)
            .toPromise()
            .then(response => response)
            .catch(this.handleError);
    }

    getSamples (platform: string) {
        if (!platform) {
            return;
        }

        // aaron note: it seems that the apigw can only support the syntax of having a single instance of
        // a given query argument, so insteand of multiple platform values, pass all values comma separated.
        var url = this.remoteSXApiUrl + '/search/samples?platform=' + encodeURIComponent(platform) + '&summary=true';
        return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    /**
     * Get the local API group overview path
     */
    getLocalAPIGroupOverviewPath (path: string) {
        return this.http.get(`${this.localApiUrl}/${path}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    addConfigOptionToStorage(myconfig: Config) {
        this.addBaseToStorage();
        this.addPathToStorage();
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(myconfig));
    }

    addBaseToStorage() {
        localStorage.setItem(this.APIX_BASE, this.base);
    }

    addPathToStorage() {
        localStorage.setItem(this.APIX_PATH, this.path);
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}

