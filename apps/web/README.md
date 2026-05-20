# @edumetric/web

Next.js 15 frontend for EduMetric CRM. App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts.

## Folder map

```
src/
├── app/
│   ├── (auth)/              /login, /register
│   ├── (student)/           Student-facing pages
│   ├── (mentor)/            Mentor-facing pages
│   ├── (tutor)/             Tutor-facing pages
│   ├── (admin)/             Admin-facing pages
│   ├── (super-admin)/       Super-admin pages
│   ├── (guest)/             Public guest pages (no auth)
│   ├── api/health/          Frontend health probe
│   ├── layout.tsx           Root layout (font, theme, providers)
│   ├── page.tsx             Landing page
│   └── globals.css          Tailwind + design tokens
├── components/
│   ├── ui/                  shadcn/ui primitives
│   ├── cards/               KpiCard, AnalyticsCard, StudentCard, PenaltyCard
│   ├── tables/              StudentTable, LeaderboardTable, ApprovalTable
│   ├── charts/              AttendanceChart, GpaChart, ScoreTrendChart
│   ├── modals/              PenaltyModal, ApprovalModal, UploadModal
│   ├── forms/               Reusable form fields
│   ├── layout/              Sidebar, Topbar, AppShell
│   ├── leaderboard/         Top3Podium, RankRow, ExplainableBreakdown
│   ├── profile/             ProfileHeader, KpiBreakdownGrid, ActivityTimeline
│   ├── kpi/                 KpiScoreGauge, ScholarshipBadge, RiskIndicator
│   └── shared/              EmptyState, LoadingSkeleton, ErrorBoundary
├── lib/
│   ├── api/                 Typed API client wrapper
│   ├── auth/                Auth helpers
│   ├── kpi/                 KPI display helpers
│   ├── hooks/               React Query hooks
│   ├── utils/               cn(), formatters
│   └── constants/           routes, role-redirect map
├── store/                   Zustand stores
├── types/                   Frontend-only types
├── styles/                  globals + tokens
├── config/                  Env / feature flags
└── middleware.ts            Route protection + role redirects
```

## Role redirect map (from Group 5)

| Role         | Path            |
|--------------|-----------------|
| Student      | `/dashboard`    |
| Mentor       | `/mentor`       |
| Tutor        | `/tutor`        |
| Admin        | `/admin`        |
| Super Admin  | `/super-admin`  |
| Guest        | `/guest/leaderboard` |

## Running

```bash
cp .env.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`.
