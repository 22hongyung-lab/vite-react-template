import { useEffect, useState } from "react";
import "./App.css";

import {
  DAYS,
  type Course,
  type Day,
  type ScheduleResult,
} from "./scheduler/types";

import { findBestSchedules } from "./scheduler/scheduler";

const STORAGE_KEY = "timetable-planner-courses";

function makeId(): string {
  return crypto.randomUUID();
}

function createCourse(number: number): Course {
  return {
    id: makeId(),
    name: `Class ${number}`,
    options: [
      {
        id: makeId(),
        name: "Option 1",
        sessions: [
          {
            id: makeId(),
            day: "Monday",
            start: "09:00",
            end: "10:00",
          },
        ],
      },
    ],
  };
}

function loadSavedCourses(): Course[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [createCourse(1)];
  }

  try {
    const parsed = JSON.parse(saved) as Course[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createCourse(1)];
    }

    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [createCourse(1)];
  }
}

function formatGap(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export default function App() {
  const [courses, setCourses] = useState<Course[]>(
    loadSavedCourses,
  );

  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [resultIndex, setResultIndex] = useState(0);
  const [message, setMessage] = useState("");

  const activeResult = results[resultIndex];

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(courses),
    );
  }, [courses]);

  function clearOldResults() {
    setResults([]);
    setResultIndex(0);
    setMessage("");
  }

  function changeCourses(
    updater: (current: Course[]) => Course[],
  ) {
    setCourses((current) => updater(current));
    clearOldResults();
  }

  function updateCourseName(
    courseId: string,
    name: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          name,
        };
      }),
    );
  }

  function addCourse() {
    changeCourses((current) => [
      ...current,
      createCourse(current.length + 1),
    ]);
  }

  function removeCourse(courseId: string) {
    changeCourses((current) =>
      current.filter(
        (course) => course.id !== courseId,
      ),
    );
  }

  function addOption(courseId: string) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        const optionNumber =
          course.options.length + 1;

        return {
          ...course,
          options: [
            ...course.options,
            {
              id: makeId(),
              name: `Option ${optionNumber}`,
              sessions: [
                {
                  id: makeId(),
                  day: "Monday",
                  start: "09:00",
                  end: "10:00",
                },
              ],
            },
          ],
        };
      }),
    );
  }

  function removeOption(
    courseId: string,
    optionId: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.filter(
            (option) => option.id !== optionId,
          ),
        };
      }),
    );
  }

  function addSession(
    courseId: string,
    optionId: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              sessions: [
                ...option.sessions,
                {
                  id: makeId(),
                  day: "Monday",
                  start: "09:00",
                  end: "10:00",
                },
              ],
            };
          }),
        };
      }),
    );
  }

  function removeSession(
    courseId: string,
    optionId: string,
    sessionId: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              sessions: option.sessions.filter(
                (session) =>
                  session.id !== sessionId,
              ),
            };
          }),
        };
      }),
    );
  }

  function updateSessionDay(
    courseId: string,
    optionId: string,
    sessionId: string,
    day: Day,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              sessions: option.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      day,
                    }
                  : session,
              ),
            };
          }),
        };
      }),
    );
  }

  function updateSessionStart(
    courseId: string,
    optionId: string,
    sessionId: string,
    start: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              sessions: option.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      start,
                    }
                  : session,
              ),
            };
          }),
        };
      }),
    );
  }

  function updateSessionEnd(
    courseId: string,
    optionId: string,
    sessionId: string,
    end: string,
  ) {
    changeCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          options: course.options.map((option) => {
            if (option.id !== optionId) {
              return option;
            }

            return {
              ...option,
              sessions: option.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      end,
                    }
                  : session,
              ),
            };
          }),
        };
      }),
    );
  }

  function clearAll() {
    const confirmed = window.confirm(
      "Clear all classes and start again?",
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);

    setCourses([
      createCourse(1),
    ]);

    setResults([]);
    setResultIndex(0);
    setMessage("");
  }

  function validateCourses(): string | null {
    if (courses.length === 0) {
      return "Add at least one class.";
    }

    for (const course of courses) {
      if (!course.name.trim()) {
        return "Every class needs a name.";
      }

      if (course.options.length === 0) {
        return `${course.name} needs at least one option.`;
      }

      for (const option of course.options) {
        if (option.sessions.length === 0) {
          return `${course.name} ${option.name} needs at least one time.`;
        }

        for (const session of option.sessions) {
          if (!session.start || !session.end) {
            return `${course.name} has an incomplete time.`;
          }

          if (session.start >= session.end) {
            return `${course.name} has an end time that is not after its start time.`;
          }
        }
      }
    }

    return null;
  }

  function generateSchedule() {
    setMessage("");

    const error = validateCourses();

    if (error) {
      setResults([]);
      setMessage(error);
      return;
    }

    const schedules = findBestSchedules(
      courses,
      20,
    );

    setResults(schedules);
    setResultIndex(0);

    if (schedules.length === 0) {
      setMessage(
        "No conflict-free timetable could be found. Try adding more options or changing the class times.",
      );
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">
            TIMETABLE PLANNER
          </div>

          <h1>Plan your classes.</h1>

          <p>
            Add your classes and their available
            times. The planner finds the combination
            with the fewest class days and shortest
            gaps.
          </p>
        </div>
      </header>

      <main className="page">
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Your classes</h2>

              <p>
                Your changes are saved automatically
                on this device.
              </p>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="clear-button"
                onClick={clearAll}
              >
                Clear all
              </button>

              <button
                type="button"
                className="button secondary"
                onClick={addCourse}
              >
                + Add class
              </button>
            </div>
          </div>

          <div className="courses">
            {courses.map((course) => (
              <article
                className="course-card"
                key={course.id}
              >
                <div className="course-heading">
                  <input
                    className="course-name"
                    value={course.name}
                    placeholder="Class name"
                    aria-label="Class name"
                    onChange={(event) =>
                      updateCourseName(
                        course.id,
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    className="icon-button danger"
                    title="Remove class"
                    aria-label={`Remove ${course.name}`}
                    onClick={() =>
                      removeCourse(course.id)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="options">
                  {course.options.map(
                    (option, optionIndex) => (
                      <div
                        className="option"
                        key={option.id}
                      >
                        <div className="option-heading">
                          <span className="option-title">
                            Option {optionIndex + 1}
                          </span>

                          {course.options.length > 1 && (
                            <button
                              type="button"
                              className="link-danger"
                              onClick={() =>
                                removeOption(
                                  course.id,
                                  option.id,
                                )
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="session-list">
                          {option.sessions.map(
                            (session) => (
                              <div
                                className="session-row"
                                key={session.id}
                              >
                                <select
                                  value={session.day}
                                  aria-label="Day"
                                  onChange={(event) =>
                                    updateSessionDay(
                                      course.id,
                                      option.id,
                                      session.id,
                                      event.target.value as Day,
                                    )
                                  }
                                >
                                  {DAYS.map((day) => (
                                    <option
                                      value={day}
                                      key={day}
                                    >
                                      {day}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="time"
                                  value={session.start}
                                  aria-label="Start time"
                                  onChange={(event) =>
                                    updateSessionStart(
                                      course.id,
                                      option.id,
                                      session.id,
                                      event.target.value,
                                    )
                                  }
                                />

                                <span
                                  className="time-arrow"
                                  aria-hidden="true"
                                >
                                  →
                                </span>

                                <input
                                  type="time"
                                  value={session.end}
                                  aria-label="End time"
                                  onChange={(event) =>
                                    updateSessionEnd(
                                      course.id,
                                      option.id,
                                      session.id,
                                      event.target.value,
                                    )
                                  }
                                />

                                <button
                                  type="button"
                                  className="icon-button danger"
                                  title="Remove time"
                                  aria-label="Remove time"
                                  onClick={() =>
                                    removeSession(
                                      course.id,
                                      option.id,
                                      session.id,
                                    )
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        <button
                          type="button"
                          className="add-link"
                          onClick={() =>
                            addSession(
                              course.id,
                              option.id,
                            )
                          }
                        >
                          + Add time
                        </button>
                      </div>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className="add-link add-option"
                  onClick={() =>
                    addOption(course.id)
                  }
                >
                  + Add another option
                </button>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="button primary generate"
            onClick={generateSchedule}
          >
            Find my timetable
          </button>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </section>

        {activeResult && (
          <section className="panel results-panel">
            <div className="result-top">
              <div>
                <div className="eyebrow dark">
                  BEST MATCH
                </div>

                <h2>Your timetable</h2>
              </div>

              <div className="result-summary">
                <strong>
                  {activeResult.daysUsed}{" "}
                  {activeResult.daysUsed === 1
                    ? "day"
                    : "days"}
                </strong>

                <span aria-hidden="true">·</span>

                <span>
                  {formatGap(
                    activeResult.gapMinutes,
                  )}{" "}
                  gaps
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {resultIndex + 1} of{" "}
                  {results.length}
                </span>
              </div>
            </div>

            <div className="selected-list">
              {activeResult.selectedOptions.map(
                (selected) => (
                  <div
                    className="selected-row"
                    key={selected.courseId}
                  >
                    <span>
                      {selected.courseName}
                    </span>

                    <small>
                      {selected.optionName}
                    </small>
                  </div>
                ),
              )}
            </div>

            <div className="result-days">
              {DAYS.map((day) => {
                const sessions =
                  activeResult.sessions.filter(
                    (session) =>
                      session.day === day,
                  );

                if (sessions.length === 0) {
                  return null;
                }

                return (
                  <div
                    className="result-day"
                    key={day}
                  >
                    <h3>{day}</h3>

                    {sessions.map((session) => (
                      <div
                        className="class-block"
                        key={`${session.courseId}-${session.id}`}
                      >
                        <div>
                          <strong>
                            {session.courseName}
                          </strong>

                          <small>
                            {session.optionName}
                          </small>
                        </div>

                        <time>
                          {session.start}
                          {" → "}
                          {session.end}
                        </time>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {results.length > 1 && (
              <div className="result-navigation">
                <button
                  type="button"
                  className="button secondary"
                  disabled={resultIndex === 0}
                  onClick={() =>
                    setResultIndex(
                      (current) =>
                        current - 1,
                    )
                  }
                >
                  ← Previous
                </button>

                <span>
                  Schedule {resultIndex + 1} of{" "}
                  {results.length}
                </span>

                <button
                  type="button"
                  className="button secondary"
                  disabled={
                    resultIndex ===
                    results.length - 1
                  }
                  onClick={() =>
                    setResultIndex(
                      (current) =>
                        current + 1,
                    )
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
