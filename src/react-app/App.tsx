import { useState } from "react";
import "./App.css";

import {
  DAYS,
  type Course,
  type Day,
  type ScheduleResult,
} from "./scheduler/types";

import { findBestSchedules } from "./scheduler/scheduler";

function makeId(): string {
  return crypto.randomUUID();
}

function createCourse(number: number): Course {
  return {
    id: makeId(),
    code: `COURSE${number}`,
    name: `Course ${number}`,
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
  const [courses, setCourses] = useState<Course[]>([
    createCourse(1),
  ]);

  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [resultIndex, setResultIndex] = useState(0);
  const [message, setMessage] = useState("");

  const activeResult = results[resultIndex];

  function addCourse() {
    setCourses((current) => [
      ...current,
      createCourse(current.length + 1),
    ]);
  }

  function removeCourse(courseId: string) {
    setCourses((current) =>
      current.filter((course) => course.id !== courseId),
    );
  }

  function updateCourse(
    courseId: string,
    field: "code" | "name",
    value: string,
  ) {
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        return {
          ...course,
          [field\]: value,
        };
      }),
    );
  }

  function addOption(courseId: string) {
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        const number = course.options.length + 1;

        return {
          ...course,
          options: [
            ...course.options,
            {
              id: makeId(),
              name: `Option ${number}`,
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
    setCourses((current) =>
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

  function updateOptionName(
    courseId: string,
    optionId: string,
    value: string,
  ) {
    setCourses((current) =>
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
              name: value,
            };
          }),
        };
      }),
    );
  }

  function addSession(
    courseId: string,
    optionId: string,
  ) {
    setCourses((current) =>
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
    setCourses((current) =>
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
                (session) => session.id !== sessionId,
              ),
            };
          }),
        };
      }),
    );
  }

  function updateSession(
    courseId: string,
    optionId: string,
    sessionId: string,
    field: "day" | "start" | "end",
    value: string,
  ) {
    setCourses((current) =>
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
              sessions: option.sessions.map((session) => {
                if (session.id !== sessionId) {
                  return session;
                }

                return {
                  ...session,
                  [field\]: value,
                };
              }),
            };
          }),
        };
      }),
    );
  }

  function validateCourses(): string | null {
    if (courses.length === 0) {
      return "Please add at least one course.";
    }

    for (const course of courses) {
      if (!course.code.trim()) {
        return "Every course needs a course code.";
      }

      if (course.options.length === 0) {
        return `${course.code} needs at least one schedule option.`;
      }

      for (const option of course.options) {
        if (!option.name.trim()) {
          return `${course.code} has an unnamed option.`;
        }

        if (option.sessions.length === 0) {
          return `${course.code} ${option.name} needs at least one session.`;
        }

        for (const session of option.sessions) {ion.start || !session.end) {
            return `${course.code} has a session with a missing time.`;
          }

          if (session.start >= session.end) {
            return `${course.code} has a session where the end time is not after the start time.`;
          }
        }
      }
    }

    return null;
  }

  function generateSchedule() {
    setMessage("");

    const validationError = validateCourses();

    if (validationError) {
      setResults([]);
      setMessage(validationError);
      return;
    }

    const schedules = findBestSchedules(courses, 20);

    setResults(schedules);
    setResultIndex(0);

    if (schedules.length === 0) {
      setMessage(
        "No conflict-free timetable could be found.",
      );
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">
            SMART SCHEDULE PLANNER
          </div>

          <h1>Build a better timetable.</h1>

          <p>
            Enter your courses and their possible schedule
            options. The planner will find conflict-free
            combinations with the fewest class days and
            shortest gaps.
          </p>
        </div>
      </header>

      <main className="page">
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Your courses</h2>

              <p>
                Add every available schedule option for each
                course.
              </p>
            </div>

            <button
              type="button"
              className="button secondary"
              onClick={addCourse}
            >
              + Add course
            </button>
          </div>

          <div className="courses">
            {courses.map((course) => (
              <article
                className="course-card"
                key={course.id}
              >
                <div className="course-heading">
                  <input
                    className="course-code"
                    value={course.code}
                    placeholder="Course code"
                    onChange={(event) =>
                      updateCourse(
                        course.id,
                        "code",
                        event.target.value,
                      )
                    }
                  />

                  <input
                    className="course-name"
                    value={course.name}
                    placeholder="Course name"
                    onChange={(event) =>
                      updateCourse(
                        course.id,
                        "name",
                        event.target.value,
                      )
                    }
                  />

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      removeCourse(course.id)
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="options">
                  {course.options.map((option) => (
                    <div
                      className="option-card"
                      key={option.id}
                    >
                      <div className="option-heading">
                        <input
                          value={option.name}
                          placeholder="Option name"
                          onChange={(event) =>
                            updateOptionName(
                              course.id,
                              option.id,
                              event.target.value,
                            )
                          }
                        />

                        <button
                          type="button"
                          className="danger-button small"
                          onClick={() =>
                            removeOption(
                              course.id,
                              option.id,
                            )
                          }
                        >
                          Remove option
                        </button>
                      </div>

                      <div className="session-list">
                        {option.sessions.map((session) => (
                          <div
                            className="session-row"
                            key={session.id}
                          >
                            <select
                              value={session.day}
                              onChange={(event) =>
                                updateSession(
                                  course.id,
                                  option.id,
                                  session.id,
                                  "day",
                                  event.target.value as Day,
                                )
                              }
                            >
                              {DAYS.map((day) => (
                                <option
                                  key={day}
                                  value={day}
                                >
                                  {day}
                                </option>
                              ))}
                            </select>

                            <div className="time-field">
                              <label>Start</label>

                              <input
                                type="time"
                                value={session.start}
                                onChange={(event) =>
                                  updateSession(
                                    course.id,
                                    option.id,
                                    session.id,
                                    "start",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="time-field">
                              <label>End</label>

                              <input
                                type="time"
                                value={session.end}
                                onChange={(event) =>
                                  updateSession(
                                    course.id,
                                    option.id,
                                    session.id,
                                    "end",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>

                            <button
                              type="button"
                              className="danger-button small"
                              aria-label="Remove session"
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
                        ))}
                      </div>

                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          addSession(
                            course.id,
                            option.id,
                          )
                        }
                      >
                        + Add session
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    addOption(course.id)
                  }
                >
                  + Add schedule option
                </button>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="button primary generate"
            onClick={generateSchedule}
          >
            Find best timetable
          </button>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </section>

        {activeResult && (
          <section className="panel results-panel">
            <div className="section-header">
              <div>
                <div className="eyebrow dark">
                  RECOMMENDED TIMETABLE
                </div>

                <h2>
                  Schedule {resultIndex + 1}
                </h2>

                <p>
                  Result {resultIndex + 1} of{" "}
                  {results.length}
                </p>
              </div>

              <div className="result-navigation">
                <button
                  type="button"
                  className="button secondary"
                  disabled={resultIndex === 0}
                  onClick={() =>
                    setResultIndex(
                      (current) => current - 1,
                    )
                  }
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  className="button secondary"
                  disabled={
                    resultIndex ===
                    results.length - 1
                  }
                  onClick={() =>
                    setResultIndex(
                      (current) => current + 1,
                    )
                  }
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="stats">
              <div className="stat-card">
                <strong>
                  {activeResult.daysUsed}
                </strong>

                <span>Class days</span>
              </div>

              <div className="stat-card">
                <strong>
                  {formatGap(
                    activeResult.gapMinutes,
                  )}
                </strong>

                <span>Total gaps</span>
              </div>
            </div>

            <div className="chosen-options">
              <h3>Selected schedule options</h3>

              <div className="option-chips">
                {activeResult.selectedOptions.map(
                  (selected) => (
                    <span
                      className="option-chip"
                      key={selected.courseId}
                    >
                      <strong>
                        {selected.courseCode}
                      </strong>
                      {" - "}
                      {selected.optionName}
                    </span>
                  ),
                )}
              </div>
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
                            {session.courseCode}
                          </strong>

                          <span>
                            {session.courseName}
                          </span>

                          <small>
                            {session.optionName}
                          </small>
                        </div>

                        <time>
                          {session.start}
                          {" - "}
                          {session.end}
                        </time>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
