import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { gigConversationsTable } from "./gigConversations";

export const gigMessagesTable = pgTable("gig_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => gigConversationsTable.id, { onDelete: "cascade" }),
  senderType: text("sender_type", { enum: ["poster", "freelancer"] }).notNull(),
  content: text("content"),
  voiceNotePath: text("voice_note_path"),
  fileAttachmentPath: text("file_attachment_path"),
  fileAttachmentName: text("file_attachment_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GigMessage = typeof gigMessagesTable.$inferSelect;
export type InsertGigMessage = typeof gigMessagesTable.$inferInsert;
