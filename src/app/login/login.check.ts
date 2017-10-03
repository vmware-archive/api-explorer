import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';

import { UserService } from '../services/user.service';


@Injectable()
export class LoginCheck implements CanActivate {
    helper: JwtHelper = new JwtHelper();

    constructor(private router: Router, private userService: UserService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let user = this.userService.getCurrentUser();
        if (user && !this.helper.isTokenExpired(user.jwt)) {
            return true;
        }
  
        this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        return false;
    }
  
}
