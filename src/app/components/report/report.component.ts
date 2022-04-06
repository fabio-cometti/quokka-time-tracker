import { TrackerService } from './../../services/tracker.service';
import { Component, OnInit } from '@angular/core';
import { Activity, DailyActivities } from 'src/app/models/activity';

@Component({
  selector: 'fc-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(public tracker: TrackerService) { }

  ngOnInit(): void {
  }

  /**
   * Delete a single activity
   * @param activity
   */
  delete(activity: Activity) {
    this.tracker.deleteActivity(activity);
  }

  /**
   * Delete all activities with the same description in a day
   * @param description
   * @param date
   */
  deleteDescription(description: string, date: Date) {
    this.tracker.deleteDescriptionsInADay(date, description);
  }

  /**
   * Delete all activities in a day
   * @param date
   */
  deleteDate(date: Date) {
    this.tracker.deleteAllInADay(date);
  }

  /**
   * Delete all activities
   */
  clearAll() {
    this.tracker.deleteAll();
  }

  /**
   * Identify a single DailyActivities by his date
   * @param index
   * @param item
   * @returns
   */
  trackByDate(index: number, item: DailyActivities) {
    return item.date.getTime();
  }

}
