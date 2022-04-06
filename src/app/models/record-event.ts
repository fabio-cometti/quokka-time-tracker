import { RecordStatus } from "./record-status";

/**
 * Descrive a record event. The status, the date and the description
 */
export interface RecordEvent {
  status: RecordStatus;
  date: Date;
  description?: string;
}
