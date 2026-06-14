import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const npsResponsesTable = pgTable("nps_responses", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  score: integer("score").notNull(),
  comment: text("comment"),
  category: text("category").default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clientHealthScoresTable = pgTable("client_health_scores", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  healthScore: real("health_score").notNull().default(100),
  npsScore: real("nps_score"),
  supportScore: real("support_score"),
  engagementScore: real("engagement_score"),
  paymentScore: real("payment_score"),
  churnRisk: text("churn_risk").notNull().default("low"),
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNpsResponseSchema = createInsertSchema(npsResponsesTable).omit({ id: true, createdAt: true });
export type InsertNpsResponse = z.infer<typeof insertNpsResponseSchema>;
export type NpsResponse = typeof npsResponsesTable.$inferSelect;

export const insertClientHealthScoreSchema = createInsertSchema(clientHealthScoresTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClientHealthScore = z.infer<typeof insertClientHealthScoreSchema>;
export type ClientHealthScore = typeof clientHealthScoresTable.$inferSelect;
