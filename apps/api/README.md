# @edumetric/api

NestJS backend for EduMetric CRM. Hosts the KPI engine, REST API, RBAC, Prisma data layer, and AI insights bridge.

## Folder map

```
src/
├── auth/                JWT login/register/me, role guards
├── users/               User entity CRUD
├── students/            Student profiles, GPA, attendance %
├── mentors/             Mentor management, group assignments
├── tutors/              Tutor management, dormitory assignments
├── achievements/        Upload + approval workflow + duplicate detection
├── attendance/          Mark/bulk-mark attendance
├── assignments/         Completion/Quality/Originality/Deadline scoring
├── tutor-evaluations/   Tutor scoring (ethics, comm, social, discipline, motiv)
├── penalties/           Penalty issuance + automatic KPI recalc
├── recovery/            Recovery tasks + verification
├── employment-bonuses/  Employment proof + admin approval
├── scoring/             ★ KPI ENGINE — formulas, recalculation, history
├── leaderboard/         Dynamic ranking with explainable breakdown
├── analytics/           Trends, risk detection, ranking history
├── notifications/       In-app notifications
├── activity-logs/       Transparency engine
├── uploads/             Cloudinary integration
├── ai/                  OpenAI/Gemini prompt-based insights
├── common/              Shared guards, filters, pipes, decorators
├── prisma/              PrismaService (singleton)
├── config/              Env validation
├── app.module.ts
└── main.ts
```

## Running

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

API will be available at `http://localhost:4000/api/v1`.

## Module structure convention

Each domain module follows:

```
modulename/
├── modulename.module.ts
├── modulename.controller.ts
├── modulename.service.ts
├── dto/
│   ├── create-modulename.dto.ts
│   └── update-modulename.dto.ts
└── modulename.service.spec.ts
```
