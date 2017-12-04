/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Type } from "@angular/core";
import { ArraySortPipe } from './sort.pipe';
import { OrderByPipe } from './orderBy.pipe';
import { FilterTagPipe } from './filterTag.pipe';
import { SafePipe } from './safe.pipe';

export * from './sort.pipe';
export * from './orderBy.pipe';
export * from './filterTag.pipe';
export * from './safe.pipe';

export const PIPES_DIRECTIVES: Type<any>[] = [
    ArraySortPipe,
    OrderByPipe,
    FilterTagPipe,
    SafePipe
];

