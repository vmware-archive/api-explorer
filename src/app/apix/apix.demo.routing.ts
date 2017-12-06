/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from "@angular/core/src/metadata/ng_module";
import { Routes, RouterModule } from "@angular/router";
import { ApixListDemo } from "./apix-list.demo";
import { ApixDetailsDemo } from "./apix-details.demo";

const ROUTES: Routes = [
    {path: "", component: ApixListDemo,},
    {path: 'apis/:id', component: ApixDetailsDemo,}
];

export const ROUTING: ModuleWithProviders = RouterModule.forChild(ROUTES);