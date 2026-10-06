export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Day = (typeof DAYS)[number];

export interface Session {
  id: string;
  day: Day;
  start: string;
  end: string;
}

export interface ScheduleOption {
  id: string;
  name: string;
  sessions: Session[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  options: ScheduleOption[];
}

export interface ScheduledSession extends Session {
  courseId: string;
  courseCode: string;
  courseName: string;
  optionId: string;
  optionName: string;
}

export interface SelectedOption {
  courseId: string;
  courseCode: string;
  courseName: string;
  optionId: string;
  optionName: string;
}

export interface ScheduleResult {
  daysUsed: number;
  gapMinutes: number;
  selectedOptions: SelectedOption[];
  sessions: ScheduledSession[];
}
