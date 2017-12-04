/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Type } from "@angular/core";
import { ApiListComponent } from "./api-list.component";
import { ApiDetailComponent } from "./api-detail.component";
import { LocalIframeComponent } from "./local-iframe.component";
import { IFrameResizerDirective } from "./iframe-resize.directive";

export * from "./api-list.component";
export * from "./api-detail.component";
export * from "./local-iframe.component";
export * from "./iframe-resize.directive";
export * from "./apix-api.service";

export const APIS_DIRECTIVES: Type<any>[] = [
    ApiListComponent,
    ApiDetailComponent,
    LocalIframeComponent,
    IFrameResizerDirective,
];
