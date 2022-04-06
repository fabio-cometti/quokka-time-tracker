/**
 * Describe an interval between two record events
 */
export interface TimeInterval {
  from: Date;
  to?: Date;
  completed: boolean;
  totalTime: number;
}
