import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const showcaseProjectsTable = pgTable("showcase_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  screenshotPath: text("screenshot_path"),
  tags: text("tags").array().notNull().default([]),
  tools: text("tools").array().notNull().default([]),
  builderName: text("builder_name").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdBy: text("created_by").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const showcaseUpvotesTable = pgTable("showcase_upvotes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => showcaseProjectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const showcaseCommentsTable = pgTable("showcase_comments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => showcaseProjectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ShowcaseProject = typeof showcaseProjectsTable.$inferSelect;
export type InsertShowcaseProject = typeof showcaseProjectsTable.$inferInsert;
export type ShowcaseComment = typeof showcaseCommentsTable.$inferSelect;
