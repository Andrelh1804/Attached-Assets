import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const conversationsTable = pgTable("omni_conversations", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("default"),
  channel: text("channel").notNull().default("whatsapp"),
  customerName: text("customer_name").notNull(),
  customerAvatar: text("customer_avatar"),
  status: text("status").notNull().default("open"),
  lastMessage: text("last_message").notNull().default(""),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  unreadCount: integer("unread_count").notNull().default(0),
  assignedTo: text("assigned_to"),
});

export const messagesTable = pgTable("omni_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  direction: text("direction").notNull().default("inbound"),
  senderName: text("sender_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OmniConversation = typeof conversationsTable.$inferSelect;
export type OmniMessage = typeof messagesTable.$inferSelect;
