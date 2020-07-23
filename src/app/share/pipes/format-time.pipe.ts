import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(time: number): any {
    if (time) {
      //  | 0：向下取整
      const temp = time | 0;
      const minute = temp / 60 | 0;
      // padStart()前置补0，因为秒数可能是个位数
      const second = (temp % 60).toString().padStart(2, '0');
      return `${minute}:${second}`;
    } else {
      return '00:00'
    }
  }

}
