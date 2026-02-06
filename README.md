# Trackman Course Map

View Trackman courses with slope and course rating. Data is synced from the Trackman GraphQL API into your own PostgreSQL database.

## Stack

- **Next.js 15** (App Router), React 19, TypeScript, Tailwind CSS
- **shadcn/ui** for components
- **Prisma** + PostgreSQL
- **react-leaflet** for the map view

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/tm_course_map`)
   - `CRON_SECRET` — Secret used to protect the `/api/sync` route (used by cron)

3. **Database**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The app redirects to `/courses`.

5. **Load data**

   Call the sync route once (or set up weekly cron):

   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/sync"
   ```

## Features

- **List** (`/courses`) — Search by name, filter by course rating and slope (min/max), optional tee type (Men’s / Women’s). URL params keep filters shareable.
- **Map** (`/courses/map`) — Map of courses with coordinates; markers open a popup with name and link to detail.
- **Detail** (`/courses/[id]`) — Course info, tees & ratings, “View on Google Maps” when available.

## Weekly sync (cron)

See [docs/CRON.md](docs/CRON.md) for how to run the sync weekly on a Hetzner Linux server (or any system with cron).

## Self-hosted (Hetzner Linux)

- Run Next.js with `npm run build` then `npm run start` (or use PM2).
- Put a reverse proxy (e.g. nginx) in front and set `DATABASE_URL` and `CRON_SECRET` in the environment.
- Run `prisma migrate deploy` on deploy.
- Add a cron job to call `/api/sync` weekly (see [docs/CRON.md](docs/CRON.md)).
