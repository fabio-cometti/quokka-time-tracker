import { Injectable } from '@angular/core';
import { Activity } from '../models/activity';
import { Command } from '../models/command';
import { RecordEvent } from '../models/record-event';

/**
 * A service for managing the persistence in the local storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   *
   * @param activities Save an array of activities in the local storage
   */
  saveActivities(activities: Activity[]) {
    localStorage.setItem('activities', JSON.stringify(activities));
  }

  /**
   * Load all activities persisted in local storage
   * @param activities
   */
  loadActivities(): Activity[] {
    const serializedActivities = localStorage.getItem('activities');
    if(!!serializedActivities) {
      const arr: Activity[]  = JSON.parse(serializedActivities);
      if(arr) {
        arr.forEach(element => {
          if(element && element.day) {
            element.day = new Date(element.day);
          }
          if(element && element.interval && element.interval.from) {
            element.interval.from = new Date(element.interval.from);
          }
          if(element && element.interval && element.interval.to) {
            element.interval.to = new Date(element.interval.to);
          }
        });
      }
      return arr;
    } else {
      return [];
    }
  }

  /**
   * Load all activities persisted in local storage and remap to an array of commands
   * @returns
   */
  loadCommands(): Command[] {
    return this.loadActivities().map(activity => { return {
      type: 'noop',
      activity: activity,
      date: activity.day
    };})
  }

  /**
   * Save the last record event generated by the user to the local storage
   * @param event
   */
  saveLastEvent(event: RecordEvent) {
    localStorage.setItem('lastRecordingEvent', JSON.stringify(event));
  }

  /**
   * Load the last record event generated by the user from the local storage
   * @returns
   */
  loadLastEvent(): RecordEvent | null {

    const saved = localStorage.getItem('lastRecordingEvent');

    if(!!saved) {
      const event: RecordEvent = JSON.parse(saved);
      if (event && event.date) {
        event.date = new Date(event.date);
      }
      return event;
    } else {
      return null;
    }
  }
}
