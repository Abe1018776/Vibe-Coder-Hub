import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gigsTable } from "./gigs";

export const gigConversationsTable = pgTable("gig_conversations", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigsTable.id, { onDelete: "cascade" }),
  freelancerName: text("freelancer_name").notNull(),
  freelancerEmail: text("freelancer_email"),
  threadToken: text("thread_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGigConversationSchema = createInsertSchema(gigConversationsTable).omit({ id: true, createdAt: true });
export type InsertGigConversation = z.infer<typeof insertGigConversationSchema>;
export type GigConversation = typeof gigConversationsTable.$inferSelect;
