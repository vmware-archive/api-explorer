/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { ApixAuthService } from '../apix-auth.service';
import { Auth } from '../apix.model';
import { config } from '../apix.config';

@Component({
    selector: 'apix-login',
    templateUrl: './login.component.html'
})

@Injectable()
export class LoginComponent implements OnInit{
    user = {username: '', password: '', tenant: ''};

    @Input() authSchemas: any[] = config.sso;

    selectedAuthId : string = 'basic';
    selectedAuth : Auth;

    showMore: boolean = false;
    //returnUrl : string;
    errorMessage : string = '';
    opened: boolean = false;
    childOpen: boolean = false;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private apixAuthService: ApixAuthService)
    {}

    ngOnInit() {
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        if (this.authSchemas.length == 1) {
            //console.log(this.authSchemas);
            this.selectedAuthId = this.authSchemas[0].id;
            this.selectedAuthChanged();
        }
    }

    login() {
        this.user.username = this.user.username.trim();
        this.user.password = this.user.password.trim();
        if (!this.user.username || !this.user.password || (this.selectedAuthId == 'vra_sso' && !this.user.tenant)) {
            this.errorMessage = 'Missing fields';
            return;
        }

        this.clearMessage();
        this.selectedAuth = this.getAuthById();
        if (this.selectedAuthId == 'vcenter_sso') {
            this.apixAuthService.vcenterLogin(this.user.username, this.user.password, this.selectedAuth).then(() => {
                //this.router.navigate([this.returnUrl]);
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        } else if (this.selectedAuthId == 'vra_sso') {
            this.apixAuthService.vraLogin(this.user.username, this.user.password, this.user.tenant, this.selectedAuth).then(() => {
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        } else if (this.selectedAuthId == 'basic') {
            this.apixAuthService.basicLogin(this.user.username, this.user.password, this.selectedAuth);
        } else {
            this.apixAuthService.login(this.user.username, this.user.password, this.selectedAuth.authUrl).then(() => {
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        }

        this.opened = false;
    }

    selectedAuthChanged() {
        if (this.selectedAuthId == 'vcenter_sso') {
            this.showMore = false;
        } else if (this.selectedAuthId == 'vra_sso') {
            this.showMore = true;
        } else {
            this.showMore = false;
        }
    }

    isLoggedIn() : boolean {
        if (this.apixAuthService.isLoggedIn()) {
            return true;
        }
        return false;
    }

    getUser(): string {
        return this.apixAuthService.getCurrentUser().username;
    }

    openLogin() : void {
        //this.newApp.shortName = this.newApp.version = this.newApp.displayName = '';
        this.opened = true;
    }

    logout() : void {
        var sessionId = sessionStorage.getItem(this.apixAuthService.SESSION_KEY);

        if (this.selectedAuthId == 'vcenter_sso') {
            this.apixAuthService.vcenterLogout(sessionId, this.selectedAuth.authUrl).then(() => {
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        } else if (this.selectedAuthId == 'vra_sso') {
            this.apixAuthService.vraLogout(sessionId, this.selectedAuth.authUrl).then(() => {
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        } else if (this.selectedAuthId == 'basic') {
            this.apixAuthService.clearSession();
        } else {
            this.apixAuthService.logout(this.selectedAuth.authUrl).then(() => {
            }).catch(response =>
                this.errorMessage = response.text() ? response.text() : response.statusText
            );
        }
    }

    private getAuthById() {
        var result = this.authSchemas.filter(auth => auth.id === this.selectedAuthId);
        if (result) {
            return Auth.fromJson(result[0]);
        }
        return null;
    }

    private clearMessage() {
        this.errorMessage = '';
    }

    private scrollToBottom(elem) {
        elem.scrollTop = elem.scrollHeight;
    }
}
