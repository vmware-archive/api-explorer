/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { environment } from '../../environments/environment';
import { AppService } from '../app.service';
import { AppUtils } from '../app.utils';
import { Auth } from '../model/auth';

@Injectable()
export class UserService {

    public USER_KEY: string = 'apix-user';
    public SESSION_KEY: string = 'apix-session-id';
    public SSO_KEY = "apix-sso";

    private auth: Auth;

    constructor(private http: Http) {
        //this.authUrl = AppUtils.getAuthApiUrl();
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

        return this.http.post(auth.authUrl + '/login', {headers: headers})
               .toPromise()
               .then(response => {
                   let value = response.json().value;
                   console.log(value);
                   let user = {username: value.name};
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
        return this.http.post(auth.authUrl + '/login', _data)
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
        console.log(auth);
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

        return this.http.delete(`${authUrl}/logout`, new RequestOptions({headers: headers}))
                .toPromise().then(() => {
                    this.clearSession();
                }).catch(response => {
                    this.clearSession();
                });
    }

    vcenterLogout(sessionId: string, authUrl: string) : Promise<any> {
        let headers = new Headers({'vmware-api-session-id': sessionId});

        return this.http.post(`${authUrl}/logout`, null, new RequestOptions({headers: headers}))
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

    /*updateCurrentUser(user): void {
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }*/

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

    clearSession(): void {
        sessionStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SSO_KEY);
    }

}
