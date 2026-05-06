# Vibe Coder Hub — VPS deployment kit

This Next.js app is meant to run on **Vercel**, with **Postgres on a Hostinger VPS**
(or any Ubuntu 22.04 / 24.04 server). The scripts in this folder set up that
Postgres instance and expose it securely so Vercel can reach it.

```
1. ssh root@76.13.102.245
2. apt-get update && apt-get install -y git
3. git clone <this repo> /opt/vibe && cd /opt/vibe/app/deploy
4. bash bootstrap-postgres.sh
5. bash expose-postgres.sh   # opens 5432 with TLS, password auth
```

You'll get a `DATABASE_URL` printed at the end. Copy it into:

- `app/.env.local` for local dev (or comment it out and use a local Postgres)
- Vercel project env vars (`DATABASE_URL`)

After Vercel build finishes, run on your laptop (with the VPS DATABASE_URL set):

```
cd app
DATABASE_URL=postgres://... pnpm db:push
```

That creates all tables.

## Hardening tips

- Replace the `0.0.0.0/0` rule in `expose-postgres.sh` with Vercel's published
  egress IP range if you want to restrict access.
- Rotate the password by re-running `bootstrap-postgres.sh` (it overwrites the
  role's password and emits the new URL).
- Take regular `pg_dump` backups (a cron snippet is in `backup.sh`).
