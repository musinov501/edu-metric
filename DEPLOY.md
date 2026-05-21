# Deploy EduMetric (no local setup)

This app is a **monorepo**: Next.js frontend + NestJS API + PostgreSQL. You do **not** need to run it on your machine.

| Part | Host | Why |
|------|------|-----|
| **Web** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Next.js 15 |
| **API + DB** | [Render](https://render.com) (free) | NestJS needs a long-running Node server + Postgres |

Vercel/Netlify only host the frontend. The API is deployed separately on Render (one-click blueprint below).

---

## Step 1 — API + database on Render (~10 min)

1. Push this repo to GitHub (if you have not already).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo. Render reads [`render.yaml`](render.yaml) and creates:
   - `edumetric-db` (PostgreSQL)
   - `edumetric-api` (NestJS)
4. When prompted for **CORS_ORIGIN**, leave blank for now (you will set it in Step 3).
5. Wait until the API service is **Live**. Copy its URL, e.g. `https://edumetric-api.onrender.com`.
6. Confirm health: open `https://YOUR-API-URL/api/v1/health` — you should see `{"status":"ok",...}`.

The blueprint runs `prisma db push` and **seeds demo data** (accounts below).

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@edumetric.dev` | `Password123!` |
| Admin | `admin@edumetric.dev` | `Password123!` |
| Tutor | `tutor@edumetric.dev` | `Password123!` |
| Mentor | `mentor@edumetric.dev` | `Password123!` |
| Student | `student@edumetric.dev` | `Password123!` |

---

## Step 2 — Frontend on Vercel (recommended)

1. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. **Root Directory**: `apps/web` (important).
3. Framework should auto-detect **Next.js**. [`apps/web/vercel.json`](apps/web/vercel.json) sets install/build for the monorepo.
4. **Environment variables**:

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-API-URL.onrender.com/api/v1` |
   | `NEXT_PUBLIC_APP_NAME` | `EduMetric` |

5. Deploy. Copy your Vercel URL, e.g. `https://edumetric.vercel.app`.

---

## Step 2 (alternative) — Frontend on Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
2. Build settings are read from [`netlify.toml`](netlify.toml) at the repo root.
3. Set the same env vars as Vercel (`NEXT_PUBLIC_API_URL`, etc.).
4. Deploy and copy your Netlify URL.

---

## Step 3 — Wire CORS (required)

The browser blocks API calls unless the API allows your frontend origin.

1. Render → **edumetric-api** → **Environment**.
2. Set **CORS_ORIGIN** to your live frontend URL (no trailing slash), e.g.  
   `https://edumetric.vercel.app`  
   Multiple sites: comma-separated, e.g. `https://a.vercel.app,https://b.netlify.app`
3. **Save** → Render redeploys the API.

Open your frontend URL → **Login** with a demo account above.

---

## Optional env vars

| Where | Variable | Purpose |
|-------|----------|---------|
| Web | `NEXT_PUBLIC_CLOUDINARY_*` | File uploads |
| API | `OPENAI_API_KEY` or `GEMINI_API_KEY` | AI insights |
| API | `CLOUDINARY_*` | Server-side uploads |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login fails / network error | Check `NEXT_PUBLIC_API_URL` ends with `/api/v1` and API health URL works |
| CORS error in browser console | Set `CORS_ORIGIN` on Render to your exact frontend URL |
| API sleeps (free tier) | First request after ~15 min idle may take 30–60s — normal on Render free |
| Build fails on Vercel/Netlify | Node **20+**; Root Directory must be `apps/web` for Vercel |

---

## Using Supabase instead of Render Postgres

1. Create a project at [supabase.com](https://supabase.com) → **Settings** → **Database** → copy **Connection string** (URI).
2. On Render, set `DATABASE_URL` to that URI (instead of the linked Render DB).
3. Redeploy API; seed still runs from the blueprint build command.
