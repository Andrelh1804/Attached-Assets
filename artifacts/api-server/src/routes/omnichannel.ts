import { Router } from "express";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { GetConversationsQueryParams, SendMessageBody } from "@workspace/api-zod";
import { tenantWhere, withTenantId } from "../lib/tenant";

const router = Router();

router.get("/omnichannel/conversations", async (req, res) => {
  try {
    const { channel, status } = GetConversationsQueryParams.parse(req.query);
    const tc = tenantWhere(conversationsTable.tenantId, req);
    let q = db.select().from(conversationsTable).$dynamic();
    if (channel) q = q.where(and(tc, eq(conversationsTable.channel, channel)));
    else if (status) q = q.where(and(tc, eq(conversationsTable.status, status)));
    else q = q.where(tc);
    const convs = await q.orderBy(sql`last_message_at desc`);
    res.json(convs.map(c => ({ ...c, lastMessageAt: c.lastMessageAt.toISOString(), createdAt: undefined })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/omnichannel/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(and(tenantWhere(conversationsTable.tenantId, req), eq(conversationsTable.id, id)));
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(sql`created_at asc`);
    res.json(msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/omnichannel/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const [conv] = await db.select().from(conversationsTable).where(and(tenantWhere(conversationsTable.tenantId, req), eq(conversationsTable.id, conversationId)));
    if (!conv) return res.status(404).json({ error: "Not found" });
    const { content } = SendMessageBody.parse(req.body);
    const [msg] = await db.insert(messagesTable).values({ conversationId, content, direction: "outbound", senderName: "Suporte Nexora" }).returning();
    await db.update(conversationsTable).set({ lastMessage: content, lastMessageAt: new Date(), unreadCount: 0 }).where(eq(conversationsTable.id, conversationId));
    res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
