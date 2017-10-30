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
import * as _ from 'lodash';

import { ApixUtils } from './apix.utils';
import { Auth } from './apix.model';
import { config } from './apix.config';

@Injectable()
export class ApixApiService {

    public CONFIG_KEY = "apix-config";

    private baseUrl;
    private remoteApiUrl;
    private localApiUrl;
    private remoteSXApiUrl;

    constructor(private http: Http, private router: Router) {
        if (!this.remoteApiUrl) {
            let configStored = localStorage.getItem(this.CONFIG_KEY);
            if (configStored) {
                let config = JSON.parse(configStored);
                this.baseUrl = config.baseUrl;
                this.remoteApiUrl = config.remoteApiUrl;
                this.localApiUrl = config.localApiurl;
                this.remoteSXApiUrl = config.remoteSXApiUrl;
            }
        }
    }

    setEnvironment (baseUrl: string, remoteApiUrl: string, localApiurl: string, sxApiUrl: string) {
        this.baseUrl = baseUrl;
        this.remoteApiUrl = remoteApiUrl;
        this.localApiUrl = localApiurl;
        this.remoteSXApiUrl = sxApiUrl;
        this.addConfigOptionToStorage();
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

    getRemoteApi(id: number): Promise<any> {
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

    public addConfigOptionToStorage() {
        let config = {baseUrl: this.baseUrl, localApiUrl: this.localApiUrl, remoteApiUrl: this.remoteApiUrl, remoteSXApiUrl: this.remoteSXApiUrl};
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}

