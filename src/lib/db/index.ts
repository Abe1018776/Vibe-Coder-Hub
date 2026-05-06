import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

declare global {
  var __pgPool: pg.Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Set it in .env.local for dev or Vercel env for prod.",
  );
}

const rawUrl = process.env.DATABASE_URL;
const needsSsl = /sslmode=/i.test(rawUrl);
const cleanedUrl = needsSsl
  ? rawUrl.replace(/([?&])sslmode=[^&]*(&|$)/i, (_m, p1, p2) =>
      p2 === "&" ? p1 : "",
    ).replace(/[?&]$/, "")
  : rawUrl;

const pool =
  global.__pgPool ??
  new Pool({
    connectionString: cleanedUrl,
    max: 10,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
export * from "./schema";
