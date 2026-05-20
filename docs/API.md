# REST API surface

Base URL: `http://localhost:4000/api/v1`

All non-auth endpoints require `Authorization: Bearer <token>`. Role-based guards enforce ownership.

## Auth
| Method | Path                    | Roles | Description                |
|--------|-------------------------|-------|----------------------------|
| POST   | `/auth/register`        | —     | Register new user          |
| POST   | `/auth/login`           | —     | Login, returns JWT         |
| POST   | `/auth/logout`          | any   | Invalidate session         |
| GET    | `/auth/me`              | any   | Current user + role        |

## Students
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/students`                         | MENTOR (assigned) / TUTOR (assigned) / ADMIN / SUPER_ADMIN |
| GET    | `/students/:id`                     | self / assigned / ADMIN+   |
| POST   | `/students`                         | ADMIN / SUPER_ADMIN        |
| PATCH  | `/students/:id`                     | ADMIN / SUPER_ADMIN        |
| DELETE | `/students/:id`                     | SUPER_ADMIN                |
| POST   | `/students/bulk-import`             | ADMIN / SUPER_ADMIN        |
| GET    | `/students/:id/analytics`           | self / assigned / ADMIN+   |
| GET    | `/students/:id/achievements`        | self / assigned / ADMIN+   |
| GET    | `/students/:id/penalties`           | self / assigned / ADMIN+   |
| GET    | `/students/:id/kpi-history`         | self / assigned / ADMIN+   |

## Mentors / Tutors
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/mentors`, `/tutors`               | ADMIN / SUPER_ADMIN        |
| POST   | `/mentors`, `/tutors`               | ADMIN / SUPER_ADMIN        |
| PATCH  | `/mentors/:id`, `/tutors/:id`       | ADMIN / SUPER_ADMIN        |
| POST   | `/mentors/:id/assign-students`      | ADMIN / SUPER_ADMIN        |

## Achievements
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/achievements/upload`              | STUDENT                    |
| GET    | `/achievements/pending`             | ADMIN / SUPER_ADMIN        |
| POST   | `/achievements/:id/approve`         | ADMIN / SUPER_ADMIN        |
| POST   | `/achievements/:id/reject`          | ADMIN / SUPER_ADMIN        |
| POST   | `/achievements/:id/request-revision`| ADMIN / SUPER_ADMIN        |

## Attendance
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/attendance`                       | MENTOR / ADMIN             |
| POST   | `/attendance/bulk`                  | MENTOR / ADMIN             |
| GET    | `/attendance/student/:id`           | self / assigned / ADMIN+   |

## Assignments
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/assignments`                      | MENTOR                     |
| POST   | `/assignments/:id/flag-plagiarism`  | MENTOR                     |
| GET    | `/assignments/student/:id`          | self / assigned / ADMIN+   |

## Tutor evaluations
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/tutor-evaluations`                | TUTOR                      |
| GET    | `/tutor-evaluations/student/:id`    | self / assigned / ADMIN+   |

## Penalties
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/penalties`                        | MENTOR / TUTOR / ADMIN     |
| GET    | `/penalties/student/:id`            | self / assigned / ADMIN+   |
| DELETE | `/penalties/:id`                    | ADMIN / SUPER_ADMIN        |

## Recovery
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/recovery/assign`                  | TUTOR / ADMIN              |
| POST   | `/recovery/:id/complete`            | TUTOR / ADMIN              |
| GET    | `/recovery/student/:id`             | self / assigned / ADMIN+   |

## Employment bonuses
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/employment-bonuses`               | STUDENT                    |
| POST   | `/employment-bonuses/:id/approve`   | ADMIN / SUPER_ADMIN        |

## KPI engine
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| POST   | `/kpi/calculate/:studentId`         | system / ADMIN+            |
| GET    | `/kpi/student/:id`                  | self / assigned / ADMIN+   |
| GET    | `/kpi/student/:id/history`          | self / assigned / ADMIN+   |

## Leaderboard
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/leaderboard`                      | any (incl. GUEST)          |
| GET    | `/leaderboard/rankings`             | any                        |
| GET    | `/leaderboard/student/:id/why`      | any — explainable breakdown|

## Analytics
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/analytics/student/:id`            | self / assigned / ADMIN+   |
| GET    | `/analytics/groups`                 | ADMIN+                     |
| GET    | `/analytics/university`             | ADMIN+ (GUEST gets sample) |

## AI insights
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/ai/insights/student/:id`          | self / ADMIN+              |
| GET    | `/ai/insights/admin`                | ADMIN+                     |
| GET    | `/ai/scholarship-probability/:id`   | self / ADMIN+              |

## Notifications
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/notifications`                    | any (own)                  |
| PATCH  | `/notifications/:id/read`           | any (own)                  |

## Activity logs
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/activity-logs`                    | ADMIN / SUPER_ADMIN        |
| GET    | `/activity-logs/student/:id`        | self / ADMIN+              |

## Export
| Method | Path                                | Roles                      |
|--------|-------------------------------------|----------------------------|
| GET    | `/export/leaderboard?format=pdf`    | ADMIN+                     |
| GET    | `/export/analytics?format=excel`    | ADMIN+                     |
| GET    | `/export/scholarship-candidates`    | ADMIN+                     |

Pagination: `?page=1&limit=20`. Filtering: `?faculty=SE&status=ELIGIBLE&risk=AT_RISK`. Sorting: `?sort=finalScore:desc`.
