import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gigsTable } from "./gigs";

export const gigRepliesTable = pgTable("gig_replies", {
  id: serial("id").primaryKey(),
  gigId: integer("gig_id").notNull().references(() => gigsTable.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  message: text("message"),
  voiceNotePath: text("voice_note_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGigReplySchema = createInsertSchema(gigRepliesTable).omit({ id: true, createdAt: true });
export type InsertGigReply = z.infer<typeof insertGigReplySchema>;
export type GigReply = typeof gigRepliesTable.$inferSelect;
