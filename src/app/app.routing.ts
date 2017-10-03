/*
 * Copyright (c) 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { ApiListComponent } from './apis/api-list.component';
import { ApiDetailComponent } from './apis/api-detail.component';
import { LoginComponent } from './login/login.component';
import { LoginCheck } from './login/login.check';


export const ROUTES: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: ApiListComponent, data: {title: 'Home'}},
    {path: 'login', component: LoginComponent, data: {title: 'Login'}},
    {path: 'apis/:id', component: ApiDetailComponent, data: {title: 'API Detail'}}

];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);

