import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

import 'rxjs/add/operator/filter';

import { UserService } from './services/user.service';
import { AppService } from './app.service';
import { APP_TITLE } from './app.config';

//declare var ga: any;

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    currentUser: any;
    impersonatedMessage: string = '';
    webappVersion: string = '';

    constructor(public router: Router, private route: ActivatedRoute, private userService: UserService,
                public appService: AppService, private title : Title) {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(event => {
                let route: ActivatedRoute = this.route;
                while (route.firstChild) route = route.firstChild;
                if (route.outlet === 'primary') {
                    let title = route.snapshot.data['title'];
                    if (route.snapshot.params['id'])
                        title += ` - ${route.snapshot.params['id']}`;
                    title += ` - ${APP_TITLE}`;
                    this.title.setTitle(title);
                    //if (typeof ga !== 'undefined' && ga)
                    //    ga('send', 'pageview', event.url);
                }
            });
    }

    showHeader(): boolean {
        return this.router.url.indexOf('/login') !== 0
                && this.router.url.indexOf('/profile-access') !== 0
                && this.router.url.indexOf('/editor') !== 0;
    }

    isLoggedIn() : boolean {
        if (this.userService.isLoggedIn()) {
            return true;
        }
        return false;
    }


    getUser(): string {
        return this.userService.getCurrentUser().name;
    }

    logout() : void {
        this.userService.logout().then(() => {
            this.router.navigate(['/login']);
        });
    }

    ngOnInit() {
        //this.getWebappVersion();
    }

}
