import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),
  currentProject: text("current_project"),
  status: text("status").notNull().default("unassigned"), // present, idle, sleep, remote, absent, unassigned
  tableId: integer("table_id"),
  seatNumber: integer("seat_number"),
  macAddress: text("mac_address"),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  idleTime: integer("idle_time_minutes").default(0).notNull(),
  totalActiveTime: integer("total_active_time_minutes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  seats: integer("seats").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  employeeName: text("employee_name").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActivity: true,
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Additional schemas for updates
export const updateEmployeeSchema = insertEmployeeSchema.partial();
export const updateTableSchema = insertTableSchema.partial();

export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
export type UpdateTable = z.infer<typeof updateTableSchema>;
