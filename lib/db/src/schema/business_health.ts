import { pgTable, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bhsSnapshotsTable = pgTable("business_health_scores", {
  id: serial("id").primaryKey(),
  score: real("score").notNull(),
  financial: real("financial").notNull(),
  commercial: real("commercial").notNull(),
  support: real("support").notNull(),
  hr: real("hr").notNull(),
  nps: real("nps").notNull(),
  churn: real("churn").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBhsSnapshotSchema = createInsertSchema(bhsSnapshotsTable).omit({ id: true, createdAt: true });
export type InsertBhsSnapshot = z.infer<typeof insertBhsSnapshotSchema>;
export type BhsSnapshot = typeof bhsSnapshotsTable.$inferSelect;
