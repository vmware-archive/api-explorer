import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SelectSearchPipe'
})
export class SelectSearchPipe implements PipeTransform {

  transform(items: Array<any>, tz: string) {
    return items.filter( item => item.match(tz));
  }

}
