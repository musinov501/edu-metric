# @edumetric/shared

Cross-app TypeScript types and enums. Imported by both `@edumetric/api` and `@edumetric/web`.

This package is the single source of truth for domain enums so frontend and backend never drift apart. Keep it tiny — only put things here that both apps need.

## Contents

- `Role` — STUDENT / MENTOR / TUTOR / ADMIN / SUPER_ADMIN / GUEST
- `ScholarshipStatus` — ELIGIBLE / AT_RISK / REJECTED / UNDER_REVIEW
- `AchievementType`, `AchievementStatus`
- `AttendanceStatus`
- `PenaltyType`, `PenaltySeverity`
- `RecoveryStatus`
- `EmploymentType`
- `RiskLevel` (UI tier — Excellent / Strong / At Risk / Critical)
- `KpiBreakdown`, `ExplainableScoreEntry` (KPI shape contracts)

## Why no build step?

Both apps consume the source `.ts` directly via path mapping. Avoiding a build step = faster iteration and no compile-output drift.
