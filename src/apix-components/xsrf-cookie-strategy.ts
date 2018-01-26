import { Request, XSRFStrategy } from '@angular/http';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';

export function ApixCookieXSRFStrategyFactory() {
    return new ApixCookieXSRFStrategy();
}

// Angular provides a Cookie XSRF strategy, but it always adds the X-XSRF-Token header
// which screws up remote cross-origin requests.
export class ApixCookieXSRFStrategy implements XSRFStrategy {
    constructor(private _cookieName: string = 'XSRF-TOKEN',
                private _headerName: string = 'X-XSRF-TOKEN') {}

    configureRequest(req: Request): void {
        const xsrfToken = getDOM().getCookie(this._cookieName);
        // Only set the X-XSRF-TOKEN header for local requests. Leave it off requests that
        // are absolute (i.e. remote calls)
        if (xsrfToken && !req.url.startsWith('https://') && !req.url.startsWith('http://')) {
            req.headers.set(this._headerName, xsrfToken);
        }
    }
}
