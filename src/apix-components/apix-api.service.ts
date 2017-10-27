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

import { ApixUtils } from './apix.utils';
import { Auth } from './apix.model';
import { config } from './apix.config';

@Injectable()
export class ApixApiService {

    public USER_KEY: string = 'apix-user';
    public SESSION_KEY: string = 'apix-session-id';
    public SSO_KEY = "apix-sso";
    public CONFIG_KEY = "apix-config";

    private baseUrl;
    private remoteApiUrl;
    private localApiUrl;
    private remoteSXApiUrl;

    private apixHostLocal = "http://localhost:4200";

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

    login(username: string, password: string, authUrl: string) : Promise<any> {
        return this.http.post(authUrl + '/login', {user: username, password: password})
               .toPromise()
               .then(response => {
                   let user = response.json();
                   console.log(user);
                   this.addUserToStorage(user);
               });
    }

    vcenterLogin(username: string, password: string, auth: Auth) : Promise<any> {
        var headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
        headers.append('vmware-use-header-authn', 'apiexplorer');

        return this.http.post(auth.authUrl, null, new RequestOptions({headers: headers}))
               .toPromise()
               .then(response => {
                   let value = response.json().value;
                   //console.log(value);
                   let user = {username: username};
                   this.addUserToStorage(user)
                   this.addAuthToStorage(auth);
                   this.addSessionIdStorage(value.sessionId);
               });
    }

    vraLogin(username: string, password: string, tenant: string, auth: Auth) : Promise<any> {
        var _data = {
            "username" : username,
            "password" : password,
            "tenant"   : tenant
        }
        return this.http.post(auth.authUrl, _data)
               .toPromise()
               .then(response => {
                   let value = response.json();
                   console.log(value);
                   let user = {username: username};
                   this.addUserToStorage(user);
                   this.addAuthToStorage(auth);
                   this.addSessionIdStorage(value.id);
                });
    }

    basicLogin(username: string, password: string, auth: Auth) {
        var _user = {"username" : username, "password" : password};
        this.addUserToStorage(_user);
        this.addAuthToStorage(auth);
    }

    logout(authUrl: string) : Promise<any> {
        return this.http.post(`${authUrl}/logout`, null, this.getAuthHeader())
                .toPromise().then(() => {
                    this.clearSession();
                }).catch(response => {
                    // Still need to clear session to allow user to login again
                    console.log(response);
                    this.clearSession();
                });
    }

    vraLogout(sessionId: string, authUrl: string) : Promise<any> {
        let headers = new Headers({'Authorization': 'Token ' + sessionId});

        return this.http.delete(`${authUrl}`, new RequestOptions({headers: headers}))
                .toPromise().then(() => {
                    this.clearSession();
                }).catch(response => {
                    this.clearSession();
                });
    }

    vcenterLogout(sessionId: string, authUrl: string) : Promise<any> {
        let headers = new Headers({'vmware-api-session-id': sessionId});

        return this.http.post(`${authUrl}`, null, new RequestOptions({headers: headers}))
                .toPromise().then(() => {
                    this.clearSession();
                }).catch(response => {
                    this.clearSession();
                });
    }

    isLoggedIn(): boolean {
        if (this.getCurrentUser())
            return true;
        return false;
    }

    getCurrentUser() {
        let user = localStorage.getItem(this.USER_KEY);
        if (!user)
            user = sessionStorage.getItem(this.USER_KEY);

        if (user)
            return JSON.parse(user);
        return null;
    }

    getAuthHeader() {
        let  user = this.getCurrentUser();
        if (user) {
            let headers = new Headers({'Authorization': 'Bearer ' + user.jwt});
            return new RequestOptions({headers: headers});
        }
        return null;
    }

    public addUserToStorage(user: any) {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    public addSessionIdStorage(sessionId: string) {
        sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }

    public addAuthToStorage(auth: any) {
        sessionStorage.setItem(this.SSO_KEY, JSON.stringify(auth));
    }

    private isPersistent(): boolean {
        let user = localStorage.getItem(this.USER_KEY);
        if (user)
            return true;
        return false;
    }

    public addConfigOptionToStorage() {
        let config = {baseUrl: this.baseUrl, localApiUrl: this.localApiUrl, remoteApiUrl: this.remoteApiUrl, remoteSXApiUrl: this.remoteSXApiUrl};
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    }

    clearSession(): void {
        sessionStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SSO_KEY);
    }

    private jwt() {
        let  user = this.getCurrentUser();
        if (user) {
            let headers = new Headers({'Authorization': 'Bearer ' + user.jwt});
            return new RequestOptions({headers: headers});
        }
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}

