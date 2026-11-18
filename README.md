# GYMFLOW — Crush Lifestyle Fitness Studio Admin Panel (Next.js)

Standalone **Next.js (App Router + TypeScript + Tailwind CSS)** admin portal for **Crush Lifestyle Fitness Studio**, designed to pair with your independently deployed FastAPI + Google Sheets + n8n backend (`backend/`).

---

## Features

- **Prompt-First AI Command Bar**: Register members, trigger email follow-ups, run the daily autopilot cycle, freeze/unfreeze memberships, record expenses, or view streak leaderboards from a single natural-language prompt bar connected to `POST /api/v1/agent/chat` and `GM-05`.
- **8 Enterprise Modules**:
  1. `Dashboard` — Live KPIs, monthly collection bar chart, package distribution, quick `GM-01`–`GM-05` workflow triggers, and audit logs.
  2. `Members` — Filterable directory, `+ Add member` registration modal, `Member 360°` drawer (trainer/batch edit, freeze, early unfreeze, renewal, archive, 18-column Google Sheets JSON preview).
  3. `Attendance` — QR/Member ID/Phone check-in console, today's occupancy table, consistency streak leaderboard, and filterable check-in history.
  4. `Payments` — Payment recording, 18% GST ledger, printable GST Tax Invoices (`9% CGST + 9% SGST`, `SAC 999723`), and refunds.
  5. `Packages` — Create & edit membership packages (`Monthly`, `Quarterly`, `Half-Yearly`, `Annual`, or custom packs).
  6. `Follow-ups` — Prioritized retention queue (`EXPIRY_T0_FINAL`, `EXPIRY_T3_URGENT`, `PENDING_DUES`, `INACTIVITY_DROPOFF`, `WINBACK`), dry-run preview, and email dispatch via `GM-02`.
  7. `Reports & analytics` — CFO Accounts P&L, CGST/SGST totals, operating expenses CRUD, and receivables aging with 1-click email reminders.
  8. `Staff & roles` — Full **n8n Control Plane & Google Sheets DB** viewer (`GM-01`–`GM-05` triggers, cron scheduler, auto-deploy, and live tab push/pull sync).

---

## Setup & Deployment

1. Copy environment config:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_BASE_URL` to your deployed Railway backend URL (`https://<your-backend>.up.railway.app`) or `http://localhost:8000` locally.
2. Install & run locally:
   ```bash
   npm install
   npm run dev
   ```
3. Build for production locally:
   ```bash
   npm run build
   npm run start
   ```

---

## Vercel Deployment (Paired with Railway Backend)

1. Push the `frontend/` folder as its own GitHub repository (or import your monorepo on **Vercel** and set **Root Directory** to `frontend`).
2. Vercel automatically detects **Next.js** and uses [`vercel.json`](./vercel.json) (`npm install`, `npm run build`, and security headers).
3. In the Vercel project **Settings -> Environment Variables** tab, configure before deploying:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend>.up.railway.app`
   - `NEXT_PUBLIC_TENANT_ID=crush-main-studio`
   - `NEXT_PUBLIC_API_KEY=<optional-backend-api-key>`
4. Deploy. All `*.vercel.app` production and preview domains are permitted by the backend's CORS configuration (`allow_origin_regex` in `backend/app/main.py`). Admins can also override the API URL at runtime from the topbar `API` settings modal in the UI.
