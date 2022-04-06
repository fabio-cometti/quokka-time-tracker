import { FormatDurationPipe } from './format-duration.pipe';
import { Pipe, PipeTransform } from '@angular/core';
import { Activity } from '../models/activity';

/**
 * Format the sum of the duration of a group of activities as a human readable string
 */
@Pipe({
  name: 'formatSum'
})
export class FormatSumPipe implements PipeTransform {

  transform(value: Activity[], ...args: unknown[]): unknown {
    const sum = value.map(a => a.interval.totalTime).reduce((prev, next) => prev + next);

    const formatDurationPipe = new FormatDurationPipe();
    return formatDurationPipe.transform(sum);
  }

}
