import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";

export const gigsTable = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["task", "hourly", "build"] }).notNull(),
  status: text("status", { enum: ["open", "closed", "in_progress"] })
    .notNull()
    .default("open"),
  tags: text("tags").array().notNull().default([]),
  requirements: text("requirements"),
  budgetMin: real("budget_min"),
  budgetMax: real("budget_max"),
  hourlyRate: real("hourly_rate"),
  recordingPath: text("recording_path"),
  publicSlug: text("public_slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Gig = typeof gigsTable.$inferSelect;
export type InsertGig = typeof gigsTable.$inferInsert;
