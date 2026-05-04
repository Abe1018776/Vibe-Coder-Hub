import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const freelancersTable = pgTable("freelancers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatarPath: text("avatar_path"),
  skills: text("skills").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  hourlyRate: real("hourly_rate"),
  portfolioLinks: text("portfolio_links").array().notNull().default([]),
  contactInfo: text("contact_info"),
  notes: text("notes"),
  tools: text("tools").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFreelancerSchema = createInsertSchema(freelancersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFreelancer = z.infer<typeof insertFreelancerSchema>;
export type Freelancer = typeof freelancersTable.$inferSelect;
