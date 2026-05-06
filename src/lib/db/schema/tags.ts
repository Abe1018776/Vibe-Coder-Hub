import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const tagsTable = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category", {
    enum: ["tool", "skill", "gig_type", "general"],
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Tag = typeof tagsTable.$inferSelect;
export type InsertTag = typeof tagsTable.$inferInsert;
