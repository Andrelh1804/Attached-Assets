import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const tenantSettingsTable = pgTable("tenant_settings", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().unique().references(() => companiesTable.id, { onDelete: "cascade" }),
  featureFlags: jsonb("feature_flags").$type<Record<string, boolean>>().default({}),
  branding: jsonb("branding").$type<Record<string, string>>().default({}),
  limits: jsonb("limits").$type<Record<string, number>>().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TenantSettings = typeof tenantSettingsTable.$inferSelect;
