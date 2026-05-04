import { Router } from "express";
import { db } from "@workspace/db";
import { gigsTable, gigRepliesTable, freelancersTable, availabilitySlotsTable, showcaseProjectsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /stats
router.get("/stats", async (_req, res) => {
  const [gigStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${gigsTable.status} = 'open')::int`,
      task: sql<number>`count(*) filter (where ${gigsTable.type} = 'task')::int`,
      hourly: sql<number>`count(*) filter (where ${gigsTable.type} = 'hourly')::int`,
      build: sql<number>`count(*) filter (where ${gigsTable.type} = 'build')::int`,
    })
    .from(gigsTable);

  const [replyStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(gigRepliesTable);

  const [freelancerStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(freelancersTable);

  const [slotStats] = await db
    .select({ open: sql<number>`count(*) filter (where ${availabilitySlotsTable.isBooked} = false)::int` })
    .from(availabilitySlotsTable);

  const [showcaseStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(showcaseProjectsTable);

  res.json({
    totalGigs: gigStats?.total ?? 0,
    openGigs: gigStats?.open ?? 0,
    totalFreelancers: freelancerStats?.total ?? 0,
    openSlots: slotStats?.open ?? 0,
    totalReplies: replyStats?.total ?? 0,
    totalShowcaseProjects: showcaseStats?.total ?? 0,
    gigsByType: {
      task: gigStats?.task ?? 0,
      hourly: gigStats?.hourly ?? 0,
      build: gigStats?.build ?? 0,
    },
  });
});

// GET /stats/recent-activity
router.get("/stats/recent-activity", async (_req, res) => {
  const [gigs, replies, freelancers, slots, showcase] = await Promise.all([
    db.select().from(gigsTable).orderBy(sql`${gigsTable.createdAt} DESC`).limit(3),
    db.select().from(gigRepliesTable).orderBy(sql`${gigRepliesTable.createdAt} DESC`).limit(3),
    db.select().from(freelancersTable).orderBy(sql`${freelancersTable.createdAt} DESC`).limit(2),
    db.select().from(availabilitySlotsTable).orderBy(sql`${availabilitySlotsTable.createdAt} DESC`).limit(2),
    db.select().from(showcaseProjectsTable).orderBy(sql`${showcaseProjectsTable.createdAt} DESC`).limit(2),
  ]);

  const items: Array<{ id: string; type: string; title: string; description: string; createdAt: Date }> = [
    ...gigs.map((g) => ({ id: `gig-${g.id}`, type: "gig_created" as const, title: `New gig posted: ${g.title}`, description: `${g.type} gig — ${g.status}`, createdAt: g.createdAt })),
    ...replies.map((r) => ({ id: `reply-${r.id}`, type: "reply_received" as const, title: `Reply from ${r.senderName}`, description: r.message ? r.message.slice(0, 80) : "Voice note reply", createdAt: r.createdAt })),
    ...freelancers.map((f) => ({ id: `freelancer-${f.id}`, type: "freelancer_added" as const, title: `Freelancer added: ${f.name}`, description: f.tools.join(", ") || "Vibe coder", createdAt: f.createdAt })),
    ...slots.map((s) => ({ id: `slot-${s.id}`, type: "slot_posted" as const, title: `Availability slot posted`, description: `${s.date} ${s.startTime}–${s.endTime} (${s.workType})`, createdAt: s.createdAt })),
    ...showcase.map((p) => ({ id: `showcase-${p.id}`, type: "showcase_submitted" as const, title: `New showcase: ${p.name}`, description: `by ${p.builderName}`, createdAt: p.createdAt })),
  ];

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json(items.slice(0, 10).map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  })));
});

export default router;
