import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tagsTable = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category", { enum: ["tool", "skill", "gig_type", "general"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTagSchema = createInsertSchema(tagsTable).omit({ id: true, createdAt: true });
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tagsTable.$inferSelect;
