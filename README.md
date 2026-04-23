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

## Deploy (Vercel + Atlas)

1. Create an Atlas cluster and user; set `MONGODB_URI` in Vercel project **Environment Variables**.
2. Set the same auth variables in Vercel. Use production `NEXTAUTH_URL` / `AUTH_URL` (e.g. `https://your-app.vercel.app`).
3. In Google OAuth credentials, add redirect URI: `https://your-app.vercel.app/api/auth/callback/google`.
4. Deploy from Git with `vercel` or the Vercel GitHub integration.

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
