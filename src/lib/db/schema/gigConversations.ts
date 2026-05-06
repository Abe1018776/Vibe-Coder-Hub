import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { gigsTable } from "./gigs";

export const gigConversationsTable = pgTable("gig_conversations", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id")
    .notNull()
    .references(() => gigsTable.id, { onDelete: "cascade" }),
  freelancerName: text("freelancer_name").notNull(),
  freelancerEmail: text("freelancer_email"),
  threadToken: text("thread_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GigConversation = typeof gigConversationsTable.$inferSelect;
export type InsertGigConversation = typeof gigConversationsTable.$inferInsert;
