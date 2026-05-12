import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";

export const competitionsTable = pgTable("competitions", {
  id: serial("id").primaryKey(),
  createdBy: text("created_by").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prizeAmount: real("prize_amount").notNull(),
  deadline: timestamp("deadline").notNull(),
  status: text("status", { enum: ["open", "judging", "closed"] })
    .notNull()
    .default("open"),
  loomUrl: text("loom_url"),
  referenceUrls: text("reference_urls").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  publicSlug: text("public_slug").notNull().unique(),
  winnerSubmissionId: integer("winner_submission_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Competition = typeof competitionsTable.$inferSelect;
export type InsertCompetition = typeof competitionsTable.$inferInsert;

export const competitionSubmissionsTable = pgTable("competition_submissions", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email"),
  submitterUserId: text("submitter_user_id"),
  submissionUrl: text("submission_url").notNull(),
  loomUrl: text("loom_url"),
  description: text("description"),
  threadToken: text("thread_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CompetitionSubmission = typeof competitionSubmissionsTable.$inferSelect;
export type InsertCompetitionSubmission = typeof competitionSubmissionsTable.$inferInsert;
