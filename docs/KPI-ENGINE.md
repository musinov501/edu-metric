# KPI Engine

The scoring engine is the heart of EduMetric. Every score must be **measurable, explainable, auditable, and traceable**.

## Final score

```
FinalScore = BaseKPI(100 max) − Penalty(20 max) + Recovery(10 max) + EmploymentBonus(10 max)
```

## Base KPI (100 max)

| Category                       | Max | Formula                                                   |
|--------------------------------|-----|-----------------------------------------------------------|
| Academic Performance           | 40  | `(GPA / 100) × 40`                                        |
| Attendance                     | 20  | `(AttendancePercent / 100) × 20`                          |
| Assignments & Projects         | 15  | `0.3·C + 0.3·Q + 0.25·O + 0.15·D`                         |
| Activities & Certificates      | 10  | Sum of admin-approved achievements (capped at 10)         |
| Tutor Evaluation               |  5  | `(Ethics + Communication + Social + Discipline + Motiv) / 5` |
| Discipline & Corporate Culture | 10  | Starts at 10, never below 0, reduced by violations        |

## Critical rules

1. **GPA < 80% → scholarship status = REJECTED.** Auto-disqualification, regardless of final score.
2. **Final score < 80 → NOT ELIGIBLE.**
3. **Final score ≥ 80 → enters competitive ranking.**

## Activity scoring table

| Activity                       | Points |
|--------------------------------|--------|
| Hackathon Participation        | +1     |
| Hackathon Winner               | +3     |
| Startup Project                | +5     |
| Mentoring Weak Students        | +3     |
| PDP Online Certificate         | +2     |
| PDP Offline Certificate        | +3     |
| National IT Certificate        | +2     |
| English Certificate            | +3     |
| International IT Certificate   | +5     |
| PDP Ecosystem Work             | +2     |

Activities must be uploaded → admin-verified → approved before counting. Smart duplicate detection required.

## Discipline violations

Start every student at 10. Floor at 0.

| Violation             | Deduction |
|-----------------------|-----------|
| Late to class         | −1        |
| Phone during lesson   | −1        |
| Missing class         | −3        |
| Ignoring warnings     | −3        |
| Plagiarism            | −15       |
| Serious misconduct    | −10       |

## Penalty severity (separate from discipline, capped at −20 total)

| Severity | Range          |
|----------|----------------|
| MINOR    | −1             |
| MEDIUM   | −3             |
| MAJOR    | −5             |
| CRITICAL | −10 to −15     |

Auto-trigger penalties for: plagiarism, attendance abuse, fake submissions.

## Recovery

`RecoveryPoints = min(|TotalPenalty| / 2, 10)`

Tasks: volunteer work, mentoring, university event support, academic support. Tutor/Admin verifies.

## Employment bonus

| Type        | Bonus range |
|-------------|-------------|
| INTERNSHIP  | 0–5         |
| PART_TIME   | 5–7         |
| FULL_TIME   | 7–10        |

Admin manually verifies proof, company, position.

## Leaderboard tie-break order

1. Final Score
2. GPA
3. Attendance
4. Discipline
5. Activities

## Risk levels (for AI panel and badges)

| Score   | Status      |
|---------|-------------|
| 90+     | Excellent   |
| 80–89   | Strong      |
| 70–79   | At Risk     |
| <70     | Critical    |

## Recalculation triggers

KPI auto-recalculates and writes a `kpi_history` row on:
- attendance change
- certificate approved
- penalty added
- recovery completed
- GPA change

Every recalculation must capture `oldScore`, `newScore`, `reason`, `timestamp` for full audit.
