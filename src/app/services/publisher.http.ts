import { Injectable, Injector } from '@angular/core';
import { ConnectionBackend, Request, RequestOptions, RequestOptionsArgs, Response, ResponseOptions, Http } from '@angular/http';
import { Router } from '@angular/router';
import {Observable} from "rxjs/Rx";

import { UserService } from './user.service';

@Injectable()
export class PublisherHttp extends Http {
    userService: UserService;
    router: Router;

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private injector: Injector) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return super.request(url, options).catch((error: Response) => {
            if (error.status === 0) {
                console.log(error);
                const options = new ResponseOptions({body: "A network error has occurred."});
                return Observable.throw(new Response(options));
            } else if (error.status === 401) {
                const message = error.text();
                if (message && 
                    (message.lastIndexOf('The user session is no longer valid') === 0
                     || message.lastIndexOf('The user session has expired'))) {
                    // Post injection for services
                    if (!this.userService)
                        this.userService = this.injector.get(UserService);
                    if (!this.router)
                        this.router = this.injector.get(Router);
                    // Redirect to login page;
                    this.userService.clearSession();
                    this.router.navigate(['/login']);
                }
            }
            return Observable.throw(error);
        });
    }

}
