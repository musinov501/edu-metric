# EduMetric CRM

> AI-powered transparent scholarship evaluation and student growth monitoring platform.

EduMetric is not a student CRM. It is an **explainable scholarship intelligence platform** that evaluates students transparently across GPA, attendance, projects, achievements, tutor feedback, discipline, and employment growth — and tells every student *why* they got their score.

## Monorepo layout

```
edumetric-crm/
├── apps/
│   ├── api/          NestJS + Prisma + PostgreSQL backend
│   └── web/          Next.js 15 (App Router) frontend
├── packages/
│   ├── shared/       Cross-app TypeScript types (roles, enums, KPI shapes)
│   └── ui-config/    Shared Tailwind preset / design tokens
├── docs/             Architecture, KPI engine spec, API surface, demo flow
└── package.json      npm workspaces root
```

## Tech stack

| Layer       | Tech                                    |
|-------------|-----------------------------------------|
| Frontend    | Next.js 15, TypeScript, Tailwind, shadcn/ui, Framer Motion, Recharts |
| Backend     | NestJS, Prisma, PostgreSQL              |
| Auth        | Clerk or Auth.js                        |
| Storage     | Cloudinary                              |
| AI          | OpenAI / Gemini (prompt-based insights) |
| Hosting     | Vercel (web) + Railway/Render (api) + Supabase (db) |

## Roles (6)

`STUDENT` · `MENTOR` · `TUTOR` · `ADMIN` · `SUPER_ADMIN` · `GUEST` (parents, no login)

## KPI in one line

`FinalScore = BaseKPI(100) − Penalty(≤20) + Recovery(≤10) + EmploymentBonus(≤10)`

Hard rule: **GPA < 80% → scholarship auto-REJECTED.** See [docs/KPI-ENGINE.md](docs/KPI-ENGINE.md).

## Deploy without running locally

See **[DEPLOY.md](DEPLOY.md)** — Vercel or Netlify for the frontend, Render (free) for API + Postgres. Demo logins are seeded automatically.

## Getting started (local dev)

```bash
# 1. Install everything
npm install

# 2. Configure env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Initialize database (Postgres must be running)
npm run db:generate
npm run db:push
npm run db:seed

# 4. Start both apps
npm run dev
# api → http://localhost:4000
# web → http://localhost:3000
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — folder structure rationale and module map
- [docs/KPI-ENGINE.md](docs/KPI-ENGINE.md) — scoring formulas, thresholds, tie-breaks
- [docs/API.md](docs/API.md) — REST surface
- [docs/DEMO-FLOW.md](docs/DEMO-FLOW.md) — judge demo script
