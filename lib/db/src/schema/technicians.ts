import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const techniciansTable = pgTable("technicians", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("default"),
  name: text("name").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("available"),
  lat: real("lat"),
  lng: real("lng"),
  ordersToday: integer("orders_today").notNull().default(0),
  completedToday: integer("completed_today").notNull().default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTechnicianSchema = createInsertSchema(techniciansTable).omit({ id: true, createdAt: true, tenantId: true });
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof techniciansTable.$inferSelect;
