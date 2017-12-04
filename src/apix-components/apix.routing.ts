/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { NgModule }            from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApiListComponent } from './apis/api-list.component';
import { ApiDetailComponent } from './apis/api-detail.component';

const apixRoutes: Routes = [
  {path: '', component: ApiListComponent, data: {title: 'APIs List'}},
  {path: 'apis', component: ApiListComponent, data: {title: 'APIs List'}},
  {path: 'apis/:id', component: ApiDetailComponent, data: {title: 'API Detail'}}
];

@NgModule({
    imports: [
      RouterModule.forChild(apixRoutes)
      /*
      RouterModule.forChild([
        {
          path: '',
          component: ApiListComponent,
          children: [
              {
                  path: 'apis',
                  component: ApiListComponent
              },
              {
                  path: 'apis/:id',
                  component: ApiDetailComponent,
              }
          ]
        }
      ])*/
    ],
    exports: [
      RouterModule
    ]
})

export class ApixRoutingModule {}

/*
constructor(private configService: ApixConfigService) {}

    detailpath = 'apis/:id';
    listpath = 'apis';

    path = this.configService.getConfigValue("path");

    if (path) {
        this.listpath = path + 'apis';
        this.detailpath = path + 'apis/:id';
    }

    const apixRoutes: Routes = [
      {path: '', component: ApiListComponent, data: {title: 'APIs List'}},
      {path: this.listpath, component: ApiListComponent, data: {title: 'APIs List'}},
      {path: this.detailpath, component: ApiDetailComponent, data: {title: 'API Detail'}}
  ];
    console.log('apix-list-path=' + this.listpath);
    console.log('apix-detail-path=' + this.detailpath);
}*/


