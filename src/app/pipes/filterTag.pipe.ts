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