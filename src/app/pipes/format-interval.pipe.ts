import { Pipe, PipeTransform } from '@angular/core';

/**
 * Format an interval as  HH:mm:ss
 */
@Pipe({
  name: 'formatInterval'
})
export class FormatIntervalPipe implements PipeTransform {

  transform(value: number | null, ...args: unknown[]): unknown {

    value = value || 0;

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    const ss = Math.floor((value / second) % 60).toString().padStart(2, '0');
    const mm = Math.floor((value / minute) % 60).toString().padStart(2, '0');
    const hh = Math.floor((value / hour)).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

}
