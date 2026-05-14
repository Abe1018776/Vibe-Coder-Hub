# Vibe Coder Hub

Next.js 15 + Drizzle + Clerk + Postgres marketplace for AI-native builders.

## Stack

- **Frontend + API:** Next.js 15 (App Router, server components) on Vercel
- **Database:** Postgres on Hostinger VPS (or any Postgres URL)
- **Auth:** Clerk
- **ORM:** Drizzle
- **UI:** Tailwind 4 + shadcn/ui

## Local dev

```
pnpm install
cp .env.example .env.local        # then fill DATABASE_URL + Clerk keys
pnpm db:push                       # create tables
pnpm dev
```

Open http://localhost:3000 — public marketplace at `/freelancers`,
admin dashboard at `/admin` (requires sign-in).

## Database (Hostinger VPS)

```
ssh root@<vps-ip>
git clone <this-repo> /opt/vibe
cd /opt/vibe/app/deploy
sudo bash bootstrap-postgres.sh
sudo bash expose-postgres.sh
```

Copy the printed `DATABASE_URL_PUBLIC` into Vercel project env vars.

## Deploy to Vercel

The GitHub repo is connected to Vercel — every push to `main` auto-deploys
to production, and other branches get preview URLs.

For the initial project setup:

```
cd app
vercel link
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
```

After the first deploy, add the resulting `*.vercel.app` domain to
**Clerk → Configure → Domains** so authentication works.
