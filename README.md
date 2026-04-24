# Unity Meetup Tool

Next.js app for running a local **Unity** meetup: public calendar and event pages for attendees, and an organizer dashboard for events, **CSV feedback** import with **charts**, and **checklists**.

## Stack

- Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- MongoDB + Mongoose
- Auth.js (NextAuth v5) with Google sign-in
- `papaparse` (CSV), `recharts` (charts), `react-big-calendar` (calendar)

## Local setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in values:

   - `MONGODB_URI` — MongoDB Atlas connection string (create a database user and allow your IP in **Network Access**).
   - `AUTH_SECRET` — random string (e.g. `openssl rand -base64 32`).
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth **Web application** client from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
   - `ORGANIZER_EMAILS` — comma-separated Google account emails that may access `/dashboard`.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Organizers sign in via **Organizer login** → `/login`.

## Deploy

The same checklist applies to **Render**, **Vercel**, **Fly.io**, etc.

1. **Atlas**

   - Create a cluster and database user.
   - In **Network Access**, add your host's outbound IP — or `0.0.0.0/0` for managed PaaS providers like Render whose egress IPs change.

2. **Environment variables** (in your provider's dashboard)

   | Var | Value |
   |---|---|
   | `MONGODB_URI` | Atlas connection string |
   | `AUTH_SECRET` | random 32-byte base64 string |
   | `NEXTAUTH_URL` | **Public HTTPS URL** of your deploy, no trailing slash, e.g. `https://your-app.onrender.com` |
   | `AUTH_URL` | Same as `NEXTAUTH_URL` (Auth.js v5 reads both) |
   | `AUTH_TRUST_HOST` | `true` (required behind a reverse proxy) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
   | `ORGANIZER_EMAILS` | comma-separated emails allowed into `/dashboard` |

3. **Google OAuth client** (Google Cloud Console → APIs & Services → Credentials)

   On the same OAuth 2.0 Web client used for local dev, add the production URLs in **addition** to the localhost ones:

   - **Authorized JavaScript origins**: `https://your-app.onrender.com`
   - **Authorized redirect URIs**: `https://your-app.onrender.com/api/auth/callback/google`

   The redirect URI must match byte-for-byte (no trailing slash, exact scheme + host + port).

   If your OAuth consent screen is in **Testing** mode, also add every sign-in email under **Test users**.

4. **Deploy** from Git. After it boots, sign in once at `/login` and check that the URL in Google's address bar contains `redirect_uri=https%3A%2F%2Fyour-app.onrender.com%2F...` — **not** `localhost`.

### Common deploy errors

- `Unsafe attempt to load URL http://localhost:3000/...` after Google sign-in → `NEXTAUTH_URL` / `AUTH_URL` on the host are still set to `localhost`.
- `redirect_uri_mismatch` from Google → the production URI isn't in the OAuth client's authorized redirect URIs (or has a typo / trailing slash).
- `MissingSecret` → `AUTH_SECRET` not set in the deployed environment.
- DB connect hangs / `ECONNREFUSED` → Atlas Network Access is missing the deploy's egress IP.

## Features (MVP)

| Area | Description |
|------|-------------|
| Public `/` | Upcoming events list + calendar |
| Public `/events/[id]` | Event detail (day, time, duration, location, budget, amenities, type) |
| Dashboard | Google login + `ORGANIZER_EMAILS` gate; events CRUD; per-event feedback CSV upload + charts; checklists (optional link to an event) |

Phase 2 (not implemented here): full expense budget tracker, team board, email/push notifications.

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # run production server
npm run lint   # ESLint
```
