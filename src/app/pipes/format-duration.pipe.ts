import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration, intervalToDuration } from 'date-fns'

/**
 * Format the duration of an activity as a human readable string
 */
@Pipe({
  name: 'formatDuration'
})
export class FormatDurationPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    const duration: Duration = intervalToDuration({ start: 0, end: value })
    return formatDuration(duration);
  }

}
