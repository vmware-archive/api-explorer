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

import { ApixUtils } from '../apix.utils';
import { Auth, Config } from '../apix.model';
import { ApixConfigService } from '../config/config.service';
import { config } from '../config/config';

@Injectable()
export class ApixApiService {
    public VMWARE_CODE_CLIENT: string = "X-VMware-Code-Client";
    public VMWARE_CODE_CLIENT_UUID: string = "X-VMware-Code-Client-UUID";

    private remoteApiUrl = config.remoteApiUrl;
    private localApiUrl = config.localApiUrl;
    private remoteSXApiUrl = config.remoteSampleExchangeUrl;

    constructor(private http: Http,
        private router: Router,
        private configService: ApixConfigService
    ) {}

    setUrls (remoteApiUrl: string, localApiUrl: string, remoteSampleExchangeUrl: string) {
        this.remoteApiUrl = remoteApiUrl;
        this.localApiUrl = localApiUrl;
        this.remoteSXApiUrl = remoteSampleExchangeUrl;
    }

    getRemoteApis() {
        let headers = new Headers();
        this.addClientHeaders(headers);

        return this.http.get(`${this.remoteApiUrl}/apis`, new RequestOptions({headers: headers}))
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
        let headers = new Headers();
        this.addClientHeaders(headers);

        return this.http.get(`${this.remoteApiUrl}/apis/${id}`, new RequestOptions({headers: headers}))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getLatestRemoteApiIdForApiUid (api_uid: string) {
        let headers = new Headers();
        this.addClientHeaders(headers);

        return this.http.get(`${this.remoteApiUrl}/apis/uids/${api_uid}`, new RequestOptions({headers: headers}))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);

    }

    getRemoteApiResources (apiId: number) {
        let headers = new Headers();
        this.addClientHeaders(headers);

        return this.http.get(`${this.remoteApiUrl}/apis/${apiId}/resources`, new RequestOptions({headers: headers}))
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getRemoteHTMLResponse (url: string) {
        let headers = new Headers();
        this.addClientHeaders(headers);

        return this.http.get(`${url}`, new RequestOptions({headers: headers}))
            .toPromise()
            .then(response => response)
            .catch(this.handleError);
    }

    getLocalHTMLResponse (url: string) {
        return this.http.get(`${url}`)
            .toPromise()
            .then(response => response)
            .catch(this.handleError);
    }

    getJSONResponse (url: string, source: string) {
        if (source == 'local') {
            return this.http.get(`${url}`)
                .toPromise()
                .then(response => response.json())
                .catch(this.handleError);
        } else {
            let headers = new Headers();
            this.addClientHeaders(headers);

            return this.http.get(`${url}`, new RequestOptions({headers: headers}))
                .toPromise()
                .then(response => response.json())
                .catch(this.handleError);
        }
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

        let headers = new Headers();
        this.addClientHeaders(headers);

        // aaron note: it seems that the apigw can only support the syntax of having a single instance of
        // a given query argument, so insteand of multiple platform values, pass all values comma separated.
        var url = this.remoteSXApiUrl + '/search/samples?platform=' + encodeURIComponent(platform) + '&summary=true';
        return this.http.get(url, new RequestOptions({headers: headers}))
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

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

    /**
     * Add client headers
     */
    private addClientHeaders(headers: Headers) {
        let vmwareCodeClient = this.configService.getConfigValue("vmwareCodeClient");
        let vmwareCodeClientUUID = this.configService.getConfigValue("vmwareCodeClientUUID");
        if (vmwareCodeClient) {
            headers.append(this.VMWARE_CODE_CLIENT, vmwareCodeClient);
        }

        if (vmwareCodeClientUUID && vmwareCodeClientUUID !== null) {
            let ga = this.getCookie('_ga');
            //console.log(ga);
            if (ga !== '') {
                headers.append(this.VMWARE_CODE_CLIENT_UUID, ga);
            }
        }
    }

    private getCookie(name: string) {
        let ca: Array<string> = document.cookie.split(';');
        let cookieName = name + "=";
        let c: string;

        for (let i: number = 0; i < ca.length; i += 1) {
            if (ca[i].indexOf(name, 0) > -1) {
                c = ca[i].substring(cookieName.length +1, ca[i].length);
                return c;
            }
        }
        return "";
    }
}

