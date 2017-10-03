import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { UserService } from "../services/user.service";
import { AppService } from '../app.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

@Injectable()
export class LoginComponent implements OnInit{

    user = {email: '', password: ''};
    rememberme = true;
    returnUrl : string;
    errorMessage : string = '';

    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, public appService: AppService,
) {
    }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    login() {
        this.user.email = this.user.email.trim();
        this.user.password = this.user.password.trim();
        if (!this.user.email || !this.user.password) {
            this.errorMessage = 'Missing fields';
            return;
        }
        let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-]+)+$/;
        if (!reg.test(this.user.email)) {
            this.errorMessage = 'Invalid email';
            return;
        }

        this.userService.login(this.user.email, this.user.password, this.rememberme).then(() => {
            this.router.navigate([this.returnUrl]);
        }).catch(response =>
            this.errorMessage = response.text() ? response.text() : response.statusText
        );
    }

}
