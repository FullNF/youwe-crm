# YouWe CRM — Real Estate Lead Management

A production-style Lead CRM for YouWe Group, backed by your existing Google Sheet
as the database (swappable to Postgres/Supabase later without touching the frontend).

```
React (Vite) → Express API → Google Sheets
```

---

## 1. What's in this repo

```
client/   React + Vite + Tailwind dashboard (dark theme)
server/   Express API (the only thing that talks to Google Sheets)
docs/     Setup guides (Firebase, Google Sheets, architecture notes)
```

Read **`docs/FIREBASE_SETUP.md`** and **`docs/GOOGLE_SHEETS_SETUP.md`** first —
those two are the only manual steps standing between you and `npm run dev`.
I cannot create a Firebase project or a Google Cloud service account on your
behalf (those require your Google account + billing/IAM access), so you'll do
that 10-minute setup once, paste 6 values into two `.env` files, and everything
else just runs.

## 2. Quick start (after you've done the setup docs)

```bash
# Backend
cd server
cp .env.example .env        # fill in the values from docs/
npm install
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env        # fill in the Firebase web config
npm install
npm run dev                 # http://localhost:5173
```

First person to sign in must be the email you put in `SEED_ADMIN_EMAIL` in the
server `.env` — that account is auto-promoted to **Admin** the first time the
server boots against an empty Users tab. Everyone else you add manually from
**Settings → Manage Users** once you're in.

## 3. Your real sheet

This was built directly against your sheet (`YouWe Group VVID`,
`1FuvgHnycrGXrBKKRAhuWnHn4Fm37aN_waLwHJl-F2hI`). Your existing columns
(`S. NO.` → `Last Updated`) are untouched — the backend only **appends** three
columns at the end: `Created At`, `Created By`, `Record ID`.

`Record ID` is the real primary key the backend uses for every update/delete.
Row position and `S. NO.` are *not* used as IDs, because a human sorting or
filtering the sheet in Google Sheets itself would otherwise silently corrupt
data. See `docs/ARCHITECTURE.md` for why.

Three more tabs are created automatically the first time the server boots:
`Timeline` (append-only history per lead), `NeedAttention` (resolve/ignore/
snooze state for the rule engine), `Users` (email → role), and `Settings`
(dropdown values, branding).

## 4. What's genuinely real vs. what's intentionally simple

Everything below **runs end to end** — there are no TODOs or stubbed handlers.
A few things are deliberately simpler than a multi-week enterprise build would
be; I'm flagging them so you know exactly what you're getting:

- **PDF export** is a clean, readable summary + lead list (via `pdfkit`), not a
  pixel-perfect branded report. Excel/CSV exports are full fidelity.
- **"Lead Health Score"** and **"Stage Pending"** detection use simple,
  readable time-based rules (see `THRESHOLDS` in
  `server/src/services/needAttention.engine.js`) — tweak the numbers there,
  no need to touch anything else.
- **Theme switching** in Settings saves a value but the UI itself ships dark
  theme only for now — flip it to light is a follow-up if you want it.
- Google Sheets has API rate limits (60 requests/min/user by default on the
  free tier) — fine for a small team, but if you scale to many concurrent
  users you'll want the Postgres migration described in `docs/ARCHITECTURE.md`
  sooner rather than later.

## 5. Tech stack

**Frontend:** React (Vite), Tailwind, React Router, React Hook Form, Axios,
Recharts, Framer Motion, React Hot Toast, Lucide Icons.

**Backend:** Node.js, Express, Google Sheets API (`googleapis`), Firebase
Admin SDK (auth verification), ExcelJS, PDFKit, Zod (validation).

**Auth:** Firebase Authentication (Email/Password + Google), roles (Admin /
Employee) stored in the `Users` sheet tab, enforced server-side on every
request.
