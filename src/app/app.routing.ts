/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { NgModule }             from '@angular/core';
import { ModuleWithProviders }  from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { ApixListDemo } from './apix-list.demo';
import { ApixDetailsDemo } from './apix-details.demo';

const appRoutes: Routes = [
    {path: '', redirectTo: 'apis', pathMatch: 'full'},
    //{path: 'apis',   redirectTo: '/apis', pathMatch: 'full' },
    //{path: "apis", loadChildren: "app/apix/apix.demo.module", data: {title: 'Apix'} }
    {path: "apis", component: ApixListDemo, data: {title: 'Apix'}},
    {path: "apis/:id", component: ApixDetailsDemo, data: {title: 'Apix Details'}}
];

@NgModule({
    imports: [
      RouterModule.forRoot(
        appRoutes,
        { enableTracing: false }
      )
      // other imports here
    ],
    exports: [
        RouterModule
      ]
  })
export class AppRoutingModule {}

