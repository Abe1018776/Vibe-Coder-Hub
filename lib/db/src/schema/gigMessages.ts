import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gigConversationsTable } from "./gigConversations";

export const gigMessagesTable = pgTable("gig_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => gigConversationsTable.id, { onDelete: "cascade" }),
  senderType: text("sender_type", { enum: ["poster", "freelancer"] }).notNull(),
  content: text("content"),
  voiceNotePath: text("voice_note_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGigMessageSchema = createInsertSchema(gigMessagesTable).omit({ id: true, createdAt: true });
export type InsertGigMessage = z.infer<typeof insertGigMessageSchema>;
export type GigMessage = typeof gigMessagesTable.$inferSelect;
