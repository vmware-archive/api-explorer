import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'profileStatus'
})
export class ProfileStatusPipe implements PipeTransform {

  transform(items: Array<any>, status: string) {
    return items.filter(item => item.state === status);
  }

}
