/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ROUTING } from "./apix.demo.routing";
import { ClarityModule } from "@clr/angular";
import { ApixComponentsModule } from "../../apix-components/apix-components.module";
import { ApixListDemo } from "./apix-list.demo";
import { ApixDetailsDemo } from "./apix-details.demo";

@NgModule({
    imports: [
        CommonModule,
        ClarityModule,
        ROUTING,
        ApixComponentsModule,
    ],
    declarations: [
        ApixListDemo,
        ApixDetailsDemo,
    ],
    exports: [
        ApixListDemo,
        ApixDetailsDemo,
    ]
})
export class ApixDemoModule {
}