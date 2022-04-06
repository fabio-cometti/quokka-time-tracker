import { Activity } from "./activity";

export type CommandType = 'noop' | 'load' | 'add' | 'delete' | 'deleteAllByDescription' | 'deleteAllByDay' | 'deleteAll';

/**
 * A command sent from the user interface
 */
export interface Command {
  type: CommandType;
  activity?: Activity;
  date?: Date;
  description?: string;
}
