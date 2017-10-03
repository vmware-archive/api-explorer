import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { environment } from '../../environments/environment';
import { AppService } from '../app.service';
import { AppUtils } from '../app.utils';

@Injectable()
export class UserService {

    private USER_KEY: string = 'vsx-user';
    private PROFILE_KEY: string = 'vsx-profile';
    private apiUrl: string;

    constructor(private http: Http) {
        this.apiUrl = AppUtils.getAuthApiUrl();
    }

    login(email: string, password: string, persistent: boolean) : Promise<any> {
        return this.http.post(this.apiUrl + '/login', {user: email, password: password})
               .toPromise()
               .then(response => {
                   let user = response.json();
                   this.addUserToStorage(user, persistent);
               });
    }

    public addUserToStorage(user: any, persistent: boolean) {
        if (persistent)
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        else
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    logout() : Promise<any> {
        return this.http.post(`${this.apiUrl}/logout`, null, this.getAuthHeader())
                .toPromise().then(() => {
                    this.clearSession();
                }).catch(response => {
                    // Still need to clear session to allow user to login again
                    console.log(response);
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

    updateCurrentUser(user): void {
        if (this.isPersistent())
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        else
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    getAuthHeader() {
        let  user = this.getCurrentUser();
        if (user) {
            let headers = new Headers({'Authorization': 'Bearer ' + user.jwt});
            return new RequestOptions({headers: headers});
        }
        return null;
    }

    private isPersistent(): boolean {
        let user = localStorage.getItem(this.USER_KEY);
        if (user)
            return true;
        return false;
    }

    clearSession(): void {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.PROFILE_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.PROFILE_KEY);
    }

}
