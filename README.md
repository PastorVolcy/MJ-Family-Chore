# MJ Family Chore

A responsive chore app built from the MJ Crew Home Chore Chart. Family members choose their name, check off zone tasks, and complete the daily finish line. An admin PIN protects assignment changes, parent sign-off, and editing the crew and zone task lists.

Run locally with `npm run dev`, then open `http://localhost:3000`. The local admin PIN is set in `.env`.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite, Zod, and server actions.

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set a secure `ADMIN_PIN` and `SESSION_SECRET`.
3. Install packages: `npm install`
4. Create the database: `npm run db:migrate -- --name init`
5. Load representative orders: `npm run db:seed`
6. Start it: `npm run dev`

Open `http://localhost:3000` for ordering and `http://localhost:3000/admin/login` for operations.

## Deployment notes

SQLite works for local development and a single persistent host volume. For serverless/multi-instance production, switch Prisma's datasource to Postgres or Turso/libSQL so orders persist across deploys. Set `ADMIN_PIN`, `SESSION_SECRET`, and the production `DATABASE_URL` in your host's environment settings; never commit `.env`.

## Operational details

- Prices are centralized in `lib/orders.ts` and totals are always recalculated on the server.
- Authentication is a secure, HTTP-only cookie gated by the environment PIN.
- Seed data is only for local testing; it clears existing local orders before adding samples.
