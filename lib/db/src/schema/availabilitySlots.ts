import { pgTable, text, serial, integer, real, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { freelancersTable } from "./freelancers";

export const availabilitySlotsTable = pgTable("availability_slots", {
  id: serial("id").primaryKey(),
  freelancerId: integer("freelancer_id").notNull().references(() => freelancersTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  durationHours: real("duration_hours").notNull(),
  hourlyRate: real("hourly_rate"),
  workType: text("work_type", { enum: ["troubleshooting", "coworking", "build", "any"] }).notNull(),
  notes: text("notes"),
  isBooked: boolean("is_booked").notNull().default(false),
  bookedByNote: text("booked_by_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlotsTable).omit({ id: true, createdAt: true });
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlotsTable.$inferSelect;
