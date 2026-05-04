import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gigsTable = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["task", "hourly", "build"] }).notNull(),
  status: text("status", { enum: ["open", "closed", "in_progress"] }).notNull().default("open"),
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

export const insertGigSchema = createInsertSchema(gigsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGig = z.infer<typeof insertGigSchema>;
export type Gig = typeof gigsTable.$inferSelect;
