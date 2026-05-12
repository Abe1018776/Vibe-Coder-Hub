import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const professionalsTable = pgTable("jewish_professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  company: text("company"),
  location: text("location"),
  bio: text("bio"),
  expertise: text("expertise").array().notNull().default([]),
  linkedIn: text("linkedin_url"),
  website: text("website_url"),
  email: text("email"),
  tags: text("tags").array().notNull().default([]),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Professional = typeof professionalsTable.$inferSelect;
export type InsertProfessional = typeof professionalsTable.$inferInsert;
