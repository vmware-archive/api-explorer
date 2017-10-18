/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Inject, Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';

import { UserService } from './services/user.service';
import { AppUtils } from './app.utils';

@Injectable()
export class AppService {

    private remoteApiUrl;
    private localApiUrl;
    private remoteSXApiUrl;

    constructor(private http: Http, private router: Router, private userService: UserService) {
        this.remoteApiUrl = AppUtils.getRemoteApiUrl();
        this.localApiUrl = AppUtils.getLocalApiUrl();
        this.remoteSXApiUrl = AppUtils.getRemoteSampleExchangeApiUrl();
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

    private jwt() {
        let  user = this.userService.getCurrentUser();
        if (user) {
            let headers = new Headers({'Authorization': 'Bearer ' + user.jwt});
            return new RequestOptions({headers: headers});
        }
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}
