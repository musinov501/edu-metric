# Architecture

## Monorepo

npm workspaces. Two apps + two shared packages. No turborepo / nx — keeping toolchain minimal for MVP velocity.

```
apps/
  api/      NestJS 10 + Prisma + PostgreSQL
  web/      Next.js 15 App Router + TS + Tailwind + shadcn/ui
packages/
  shared/   Domain enums, KPI types, scholarship status — imported by both apps
  ui-config/ Tailwind preset + design tokens (Inter font, Indigo primary)
```

## Backend (apps/api)

```
src/
├── auth/                JWT/Clerk-compatible auth, login, register, /me
├── users/               User CRUD (admin/super-admin facing)
├── students/            Student profiles, GPA, attendance %, scholarship status
├── mentors/             Mentor management, group assignments
├── tutors/              Tutor management, dormitory assignments
├── achievements/        Upload, approval workflow, duplicate detection
├── attendance/          Mark present/absent/late/excused, bulk attendance
├── assignments/         Completion/Quality/Originality/Deadline scoring
├── tutor-evaluations/   Ethics/Communication/SocialActivity/Discipline/Motivation
├── penalties/           7 categories × 4 severities, auto-score-update
├── recovery/            Recovery tasks, min(|penalty|/2, 10) cap
├── employment-bonuses/  Internship/Part-time/Full-time, admin-verified
├── scoring/             KPI ENGINE — the heart of the system
├── leaderboard/         Dynamic ranking with explainable breakdown
├── analytics/           GPA trends, attendance, ranking history, risk detection
├── notifications/       In-app notifications, event-driven
├── activity-logs/       Transparency engine — every action logged
├── uploads/             Cloudinary integration
├── ai/                  OpenAI/Gemini prompt-based insights
├── common/              Guards, filters, decorators, interceptors, pipes
├── prisma/              PrismaService (singleton)
├── config/              Env validation, config exports
├── app.module.ts
└── main.ts
```

Each module follows NestJS convention:
- `*.module.ts` — module class
- `*.controller.ts` — REST endpoints
- `*.service.ts` — business logic
- `dto/` — request/response DTOs with class-validator
- `entities/` — Prisma-typed return shapes

## Frontend (apps/web)

```
src/
├── app/
│   ├── (auth)/          /login, /register
│   ├── (student)/       /dashboard, /profile, /achievements, /leaderboard, /analytics, /notifications, /settings
│   ├── (mentor)/        /mentor/{dashboard,students,attendance,assignments,feedback,analytics,leaderboard}
│   ├── (tutor)/         /tutor/{dashboard,students,social-evaluation,recovery-tasks,discipline,reports}
│   ├── (admin)/         /admin/{overview,students,mentors,tutors,achievements,approvals,leaderboard,analytics,penalties,reports,settings}
│   ├── (super-admin)/   /super-admin/{kpi-config,api-integrations,role-management,system-logs,platform-settings}
│   ├── (guest)/         /guest/{leaderboard,students,statistics}  ← no auth required
│   ├── api/health/      Frontend health probe
│   ├── layout.tsx
│   ├── page.tsx         Landing
│   ├── globals.css
│   └── middleware.ts    Role-gating middleware
├── components/
│   ├── ui/              shadcn/ui primitives
│   ├── cards/           KpiCard, AnalyticsCard, StudentCard, PenaltyCard
│   ├── tables/          StudentTable, LeaderboardTable, ApprovalTable
│   ├── charts/          AttendanceChart, GpaChart, ScoreTrendChart
│   ├── modals/          PenaltyModal, ApprovalModal, UploadModal
│   ├── forms/
│   ├── layout/          Sidebar, Topbar, AppShell
│   ├── leaderboard/     Top3Podium, RankRow, ExplainableBreakdown
│   ├── profile/         ProfileHeader, KpiBreakdownGrid, ActivityTimeline
│   ├── kpi/             KpiScoreGauge, ScholarshipBadge, RiskIndicator
│   └── shared/          EmptyState, LoadingSkeleton, ErrorBoundary
├── lib/
│   ├── api/             Typed API client (axios/fetch wrapper)
│   ├── auth/            Auth helpers / Clerk integration
│   ├── kpi/             KPI display helpers (formulas live on backend)
│   ├── hooks/           useStudent, useLeaderboard, useNotifications
│   ├── utils/           cn, formatDate, formatScore
│   └── constants/       routes, role-redirect map
├── store/               Zustand stores (auth, notifications, ui)
├── types/               Frontend-only types
├── styles/              globals.css, tailwind config helpers
└── config/              Env + feature flags
```

Route groups (`(role)`) keep URL clean while letting each role have its own layout (sidebar/topbar).

## Shared package (packages/shared)

Single source of truth for enums consumed by both apps:
- `Role` — STUDENT / MENTOR / TUTOR / ADMIN / SUPER_ADMIN / GUEST
- `ScholarshipStatus` — ELIGIBLE / AT_RISK / REJECTED / UNDER_REVIEW
- `AchievementStatus` — PENDING / APPROVED / REJECTED / REVISION_REQUIRED
- `AchievementType`, `PenaltyType`, `PenaltySeverity`, `AttendanceStatus`, etc.
- KPI shapes: `KpiBreakdown`, `ExplainableScoreEntry`

## Build order (per Group 2 spec)

1. **First wave:** users, students, achievements, kpiScores, penalties, activityLogs
2. **Second wave:** tutorEvaluations, recovery, notifications
3. **Third wave:** employment bonuses, advanced analytics

## UI priority (per Group 4 spec)

1. Student Dashboard, Admin Dashboard, Leaderboard, Student Profile (must look amazing)
2. Analytics, Approvals, Achievements
3. Settings, Notifications, Logs
