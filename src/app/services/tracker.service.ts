import { RecordStatus } from './../models/record-status';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { Guid } from 'guid-typescript';
import {
  BehaviorSubject,
  bufferCount,
  distinctUntilChanged,
  filter,
  interval,
  map,
  merge,
  Observable,
  of,
  scan,
  share,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  tap,
  withLatestFrom,
} from 'rxjs';
import { RecordEvent } from '../models/record-event';
import { TimeInterval } from '../models/time-interval';
import { Activity, DailyActivities, emptyActivity } from '../models/activity';
import { Command, CommandType } from '../models/command';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private interval$: Observable<number> = interval(1000);
  private recordingSubject: Subject<RecordStatus> = new Subject<RecordStatus>();
  private activityDescriptions$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private activityDescriptionsSubscription = new Subscription();

  /**
   * The last tracked event saved in localstorage. If not present a default paused event is emitted
   */
  private lastEvent: Observable<RecordEvent> = of(this.storage.loadLastEvent() || { 'status': 'paused', 'date': new Date(), description: '' });

  /**
   * Emit all the recording events making some work:
   * 1- It start with the last saved event or a default one
   * 2- Emit a new event only if different from the previous (2 consecutive start recording events are not admitted, so 2 consecutive paused events)
   * 3- Combine the event with the activity description field and attach a timestamp
   * 4- Save the emitted event in the local storage
   * 5- Share the resulting observable so it emits only once
   */
  private eventSource$: Observable<RecordEvent> =
    merge(this.lastEvent,
      this.recordingSubject.pipe(
        distinctUntilChanged(), //Emit only if different from previous event
        withLatestFrom(this.activityDescriptions$), //Combine with the activity descritpion
        map(([status, description]) => {
          return { status, description, date: new Date() }; //Map to a new event
        }),
        tap(event => this.storage.saveLastEvent(event)) //Save the event
      )
    ).pipe(shareReplay());

  /**
   * Emit a paired couple of events a start recording event and his correlated pause event
   */
  private activityCompleted$ = this.eventSource$.pipe(
    bufferCount(2, 1),
    filter((events) => events[1].status === 'paused'),
    map((events) => this.getActivity(events))
  );

  /**
   * A subject for UI Comands
   */
  commands = new Subject<Command>();

  /**
   * All activities. It process a new command and generate a new array of activities
   */
  activities$: Observable<Activity[]> = this.commands.pipe(
    startWith({'type': 'load' as CommandType}),
    scan((acc: Command[], curr: Command) => {
      switch(curr.type) {
        case 'add':
          return [...acc, curr];
        case 'delete':
          return acc.filter(a => a.activity?.uid !== curr.activity?.uid);
        case 'deleteAllByDescription':
          return acc.filter(a => !(a.activity?.day.getTime() === curr.date?.getTime() && a.activity?.description === curr.description));
        case 'deleteAllByDay':
          return acc.filter(a => a.activity?.day.getTime() !== curr.date?.getTime());
        case 'deleteAll':
          return [];
        case 'noop':
        default:
          return acc;
      }
    }, this.storage.loadCommands() || []),
    map( ops => ops.map(op => op.activity || emptyActivity())),
    tap(activities => this.storage.saveActivities(activities))
  );

  /**
   * Descriptions of all tracked activities
   */
  descriptions$ = this.activities$.pipe(
    tap(activities => console.log(activities)),
    map(activities => activities.map(a => a.description).filter(this.onlyUnique))
  );

  /**
   * Periodically emit the last event
   */
  private lastEventInterval$ = this.interval$.pipe(
    withLatestFrom(this.eventSource$)
  );

  /**
   * Periodically emit the last start recordind interval
   */
  private lastStartRecordingEventInterval$ = this.lastEventInterval$.pipe(
    filter(([index, event]) => event.status === 'recording')
  );

  /**
   * Time since last start recording event
   */
  recordingTime$ = this.lastStartRecordingEventInterval$.pipe(
    map(
      ([index, lastStartRecordingEvent]) =>
        new Date().getTime() - lastStartRecordingEvent.date.getTime()
    )
  );

  /**
   * Indicate if the service is recording or paused
   */
  isRecording$ = this.eventSource$.pipe(
    map((event) => event.status === 'recording')
  );

  /**
   * A stream of activities grouped by date
   */
  activitiesByDay$ = this.activities$.pipe(
    map((activities: Activity[]) => {

      const result: { [key: string]: DailyActivities } = {};

      activities.forEach(a => {
        result[a.day.toISOString()] = result[a.day.toISOString()] || { date: a.day, activities: {} };
        result[a.day.toISOString()].activities[a.description] = result[a.day.toISOString()].activities[a.description] || [];
        result[a.day.toISOString()].activities[a.description].push(a);
      });

      return Object.values(result);
    })
  );

  /**
   * Observable for blinking cursor every 2 seconds
   */
  blink$: Observable<boolean> = this.interval$.pipe(
    withLatestFrom(this.isRecording$),
    map(([index, isRecording]) => isRecording && index % 2 === 0)
  );

  constructor(private storage: StorageService) {
    this.activityCompleted$.subscribe(activity => this.addActivity(activity));
  }

  /**
   * Start a recording session
   */
  start(): void {
    this.recordingSubject.next('recording');
  }

  /**
   * Pause a recording session
   */
  pause(): void {
    this.recordingSubject.next('paused');
  }

  /**
   * Bind an activity description Observable to the service (e.g. a FormControl)
   * @param stream$
   */
  setActivityDescriptionsStream(stream$: Observable<string>): void {
    this.activityDescriptionsSubscription.unsubscribe;
    this.activityDescriptionsSubscription = stream$.subscribe((description) =>
      this.activityDescriptions$.next(description)
    );
  }

  /**
   * Add a new activity generating a new command
   * @param activity
   */
  addActivity(activity: Activity): void {
    this.commands.next({
      type: 'add',
      activity: activity,
      date: activity.day
    });
  }

  /**
   * Delete an activity
   * @param activity
   */
  deleteActivity(activity: Activity) {
    this.commands.next({'type': 'delete', 'activity': activity});
  }

  /**
   * Delete all the activities in a day with the same description
   * @param date
   * @param description
   */
  deleteDescriptionsInADay(date: Date, description: string) {
    this.commands.next({'type': 'deleteAllByDescription', 'date': date, 'description': description});
  }

  /**
   * Delete all the activities in a day
   * @param date
   */
  deleteAllInADay(date: Date) {
    this.commands.next({'type': 'deleteAllByDay', 'date': date});
  }

  /**
   * Delete all the activities
   */
  deleteAll() {
    this.commands.next({'type': 'deleteAll'});
  }

  /**
   * Generate an Activity from 2 paired events (start-paused)
   * @param events
   * @returns
   */
  private getActivity(events: RecordEvent[]): Activity {
    const interval: TimeInterval = {
      from: events[0].date,
      to: events[1].date,
      completed: true,
      totalTime: events[1].date.getTime() - events[0].date.getTime(),
    };

    const activity = {
      uid: Guid.raw(),
      description: events[0]?.description?.toUpperCase() || '',
      day: new Date(interval.from.getFullYear(), interval.from.getMonth(), interval.from.getDate()),
      month: interval.from.getMonth().toString(),
      interval: interval
    };

    return activity;
  }

  private onlyUnique(value: string, index: number, self: string[]): boolean {
    return self.indexOf(value) === index;
  }
}
