import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const showcaseProjectsTable = pgTable("showcase_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  screenshotPath: text("screenshot_path"),
  tags: text("tags").array().notNull().default([]),
  tools: text("tools").array().notNull().default([]),
  builderName: text("builder_name").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertShowcaseProjectSchema = createInsertSchema(showcaseProjectsTable).omit({ id: true, upvotes: true, createdAt: true, updatedAt: true });
export type InsertShowcaseProject = z.infer<typeof insertShowcaseProjectSchema>;
export type ShowcaseProject = typeof showcaseProjectsTable.$inferSelect;
