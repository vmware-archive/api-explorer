/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { NgModule }            from '@angular/core';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { ApiListComponent } from './apis/api-list.component';
import { ApiDetailComponent } from './apis/api-detail.component';

let detailpath = 'apis/:id';
let listpath = 'apis';
let path = localStorage.getItem("apix-path");

if (path) {
  listpath = path + 'apis';
  detailpath = path + 'apis/:id';
}

const apixRoutes: Routes = [
    {path: '', component: ApiListComponent, data: {title: 'APIs List'}},
    {path: listpath, component: ApiListComponent, data: {title: 'APIs List'}},
    {path: detailpath, component: ApiDetailComponent, data: {title: 'API Detail'}}
];

@NgModule({
    imports: [
      RouterModule.forChild(apixRoutes)
    ],
    exports: [
      RouterModule
    ]
  })
export class ApixRoutingModule { }


