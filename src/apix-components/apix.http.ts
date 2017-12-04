/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, Injector } from '@angular/core';
import { ConnectionBackend, Request, RequestOptions, RequestOptionsArgs, Response, ResponseOptions, Http } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from "rxjs/Rx";

import { ApixAuthService } from './login/apix-auth.service';

/**
 * This class extends the Angular Http class to handle the network and 401 errors.
 */
@Injectable()
export class ApixHttp extends Http {
    router: Router;
    apixAuthService: ApixAuthService;

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
                    if (!this.apixAuthService)
                        this.apixAuthService = this.injector.get(ApixAuthService);
                    if (!this.router)
                        this.router = this.injector.get(Router);
                    // Redirect to login page;
                    this.apixAuthService.clearSession();
                    this.router.navigate(['/login']);
                }
            }
            return Observable.throw(error);
        });
    }

}
