import { TimeInterval } from './time-interval';

/**
 * Descrive an activity tracke from start to stop
 */
export interface Activity {
  uid: string;
  description: string;
  day: Date;
  month: string;
  interval: TimeInterval;
}

/**
 * Group all the activities in a day
 */
export interface DailyActivities {
  activities: ActivityByDescription;
  date: Date;
}

/**
 * Group all the activities in a day with the same description
 */
export interface ActivityByDescription {
  [description: string]: Activity[];
}

/**
 *
 * @returns Return an empty activity
 */
export function emptyActivity(): Activity {
  return {
    uid: '',
    description: '',
    day: new Date(),
    month: '',
    interval: {
      completed: false,
      from: new Date(),
      totalTime: 0,
    },
  };
}
