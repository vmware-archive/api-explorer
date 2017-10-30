/*
 * Copyright (c) 2016-2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash'
@Pipe({
    name: 'filterTag'
})
export class FilterTagPipe implements PipeTransform {

    transform(items: Array<any>) {
        return items.filter(item => item.category === 'platform' || item.category === 'programming-language');
    }
}