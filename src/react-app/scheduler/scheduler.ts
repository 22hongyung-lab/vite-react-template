import type {
  Course,
  ScheduleOption,
  ScheduleResult,
  ScheduledSession,
  Session,
} from "./types";

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function sessionsConflict(a: Session, b: Session): boolean {
  if (a.day !== b.day) {
    return false;
  }

  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);

  return aStart < bEnd && bStart < aEnd;
}

function optionConflicts(
  option: ScheduleOption,
  existingSessions: ScheduledSession[],
): boolean {
  for (const newSession of option.sessions) {
    for (const existingSession of existingSessions) {
      if (sessionsConflict(newSession, existingSession)) {
        return true;
      }
    }
  }

  return false;
}

function calculateGapMinutes(
  sessions: ScheduledSession[],
): number {
  let totalGap = 0;

  const sessionsByDay: Record<string, ScheduledSession[]> = {};

  for (const session of sessions) {
    if (!sessionsByDay[session.day]) {
      sessionsByDay[session.day] = [];
    }

    sessionsByDay[session.day].push(session);
  }

  for (const daySessions of Object.values(sessionsByDay)) {
    daySessions.sort(
      (a, b) =>
        timeToMinutes(a.start) - timeToMinutes(b.start),
    );

    for (let i = 1; i < daySessions.length; i++) {
      const previousEnd = timeToMinutes(
        daySessions[i - 1].end,
      );

      const currentStart = timeToMinutes(
        daySessions[i].start,
      );

      const gap = currentStart - previousEnd;

      if (gap > 0) {
        totalGap += gap;
      }
    }
  }

  return totalGap;
}

function buildResult(
  courses: Course[],
  selectedOptions: ScheduleOption[],
): ScheduleResult {
  const sessions: ScheduledSession[] = [];

  for (let i = 0; i < selectedOptions.length; i++) {
    const option = selectedOptions[i];
    const course = courses[i];

    for (const session of option.sessions) {
      sessions.push({
        ...session,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        optionId: option.id,
        optionName: option.name,
      });
    }
  }

  sessions.sort((a, b) => {
    const dayDifference =
      DAY_ORDER[a.day] - DAY_ORDER[b.day];

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return timeToMinutes(a.start) - timeToMinutes(b.start);
  });

  const uniqueDays = new Set(
    sessions.map((session) => session.day),
  );

  const selectedOptionResults = selectedOptions.map(
    (option, index) => ({
      courseId: courses[index].id,
      courseCode: courses[index].code,
      courseName: courses[index].name,
      optionId: option.id,
      optionName: option.name,
    }),
  );

  return {
    daysUsed: uniqueDays.size,
    gapMinutes: calculateGapMinutes(sessions),
    selectedOptions: selectedOptionResults,
    sessions,
  };
}

export function findBestSchedules(
  courses: Course[],
  maxResults = 10,
): ScheduleResult[] {
  if (courses.length === 0) {
    return [];
  }

  for (const course of courses) {
    if (course.options.length === 0) {
      return [];
    }
  }

  const results: ScheduleResult[] = [];

  function search(
    courseIndex: number,
    selectedOptions: ScheduleOption[],
    existingSessions: ScheduledSession[],
  ): void {
    if (courseIndex === courses.length) {
      results.push(buildResult(courses, selectedOptions));
      return;
    }

    const course = courses[courseIndex];

    for (const option of course.options) {
      if (optionConflicts(option, existingSessions)) {
        continue;
      }

      const newSessions: ScheduledSession[] = [];

      for (const session of option.sessions) {
        newSessions.push({
          ...session,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          optionId: option.id,
          optionName: option.name,
        });
      }

      search(
        courseIndex + 1,
        [...selectedOptions, option],
        [...existingSessions, ...newSessions],
      );
    }
  }

  search(0, [], []);

  results.sort((a, b) => {
    if (a.daysUsed !== b.daysUsed) {
      return a.daysUsed - b.daysUsed;
    }

    return a.gapMinutes - b.gapMinutes;
  });

  return results.slice(0, maxResults);
}
