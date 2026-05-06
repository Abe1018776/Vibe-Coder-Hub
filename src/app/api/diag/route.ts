import { NextResponse } from "next/server";
import {
  db,
  gigsTable,
  freelancersTable,
  availabilitySlotsTable,
  showcaseProjectsTable,
  gigMessagesTable,
} from "@/lib/db";
import { eq, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};
  async function run<T>(name: string, fn: () => Promise<T>) {
    try {
      checks[name] = { ok: true, result: await fn() };
    } catch (e) {
      checks[name] = {
        ok: false,
        error: (e as Error).message,
        stack: (e as Error).stack?.split("\n").slice(0, 5),
      };
    }
  }

  await run("gigCounts", () =>
    db
      .select({
        type: gigsTable.type,
        status: gigsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(gigsTable)
      .groupBy(gigsTable.type, gigsTable.status),
  );
  await run("totalFreelancers", () =>
    db.select({ c: sql<number>`count(*)::int` }).from(freelancersTable),
  );
  await run("openSlots", () =>
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(availabilitySlotsTable)
      .where(eq(availabilitySlotsTable.isBooked, false)),
  );
  await run("totalShowcase", () =>
    db.select({ c: sql<number>`count(*)::int` }).from(showcaseProjectsTable),
  );
  await run("totalReplies", () =>
    db.select({ c: sql<number>`count(*)::int` }).from(gigMessagesTable),
  );
  await run("recentGigs", () =>
    db.select().from(gigsTable).orderBy(desc(gigsTable.createdAt)).limit(8),
  );

  return NextResponse.json(checks);
}
