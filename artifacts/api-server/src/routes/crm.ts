import { Router } from "express";
import { db, leadsTable, contactsTable } from "@workspace/db";
import { eq, ilike, or, sql, and } from "drizzle-orm";
import {
  GetLeadsQueryParams,
  CreateLeadBody,
  UpdateLeadBody,
  GetContactsQueryParams,
  CreateContactBody,
  UpdateContactBody,
} from "@workspace/api-zod";
import { tenantWhere, andTenant, withTenantId } from "../lib/tenant";

const router = Router();

router.get("/crm/leads", async (req, res) => {
  try {
    const { stage, search } = GetLeadsQueryParams.parse(req.query);
    const tc = tenantWhere(leadsTable.tenantId, req);
    let query = db.select().from(leadsTable).$dynamic();
    if (stage) query = query.where(and(tc, eq(leadsTable.stage, stage)));
    else if (search) query = query.where(and(tc, or(ilike(leadsTable.name, `%${search}%`), ilike(leadsTable.email, `%${search}%`))));
    else query = query.where(tc);
    const leads = await query.orderBy(sql`created_at desc`);
    res.json(leads.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt?.toISOString() ?? null })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crm/leads", async (req, res) => {
  try {
    const data = CreateLeadBody.parse(req.body);
    const [lead] = await db.insert(leadsTable).values(withTenantId({ ...data, aiScore: Math.floor(Math.random() * 40) + 60 }, req)).returning();
    res.status(201).json({ ...lead, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/crm/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [lead] = await db.select().from(leadsTable).where(and(tenantWhere(leadsTable.tenantId, req), eq(leadsTable.id, id)));
    if (!lead) return res.status(404).json({ error: "Not found" });
    res.json({ ...lead, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/crm/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateLeadBody.parse(req.body);
    const [lead] = await db.update(leadsTable).set(data).where(and(tenantWhere(leadsTable.tenantId, req), eq(leadsTable.id, id))).returning();
    if (!lead) return res.status(404).json({ error: "Not found" });
    res.json({ ...lead, createdAt: lead.createdAt.toISOString(), updatedAt: lead.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/crm/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(leadsTable).where(and(tenantWhere(leadsTable.tenantId, req), eq(leadsTable.id, id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crm/pipeline", async (req, res) => {
  try {
    const stages = ["prospeccao", "qualificacao", "proposta", "negociacao", "fechado"];
    const allLeads = await db.select().from(leadsTable).where(tenantWhere(leadsTable.tenantId, req)).orderBy(sql`created_at desc`);
    const pipeline = stages.map(stage => {
      const stageLeads = allLeads.filter(l => l.stage === stage);
      return {
        stage,
        count: stageLeads.length,
        totalValue: stageLeads.reduce((sum, l) => sum + (l.value ?? 0), 0),
        leads: stageLeads.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt?.toISOString() ?? null })),
      };
    });
    res.json(pipeline);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/crm/contacts", async (req, res) => {
  try {
    const { search } = GetContactsQueryParams.parse(req.query);
    const tc = tenantWhere(contactsTable.tenantId, req);
    let query = db.select().from(contactsTable).$dynamic();
    if (search) query = query.where(and(tc, or(ilike(contactsTable.name, `%${search}%`), ilike(contactsTable.email, `%${search}%`))));
    else query = query.where(tc);
    const contacts = await query.orderBy(sql`created_at desc`);
    res.json(contacts.map(c => ({ ...c, tags: c.tags ?? [], createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crm/contacts", async (req, res) => {
  try {
    const data = CreateContactBody.parse(req.body);
    const [contact] = await db.insert(contactsTable).values(withTenantId(data, req)).returning();
    res.status(201).json({ ...contact, tags: contact.tags ?? [], createdAt: contact.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.patch("/crm/contacts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateContactBody.parse(req.body);
    const [contact] = await db.update(contactsTable).set(data).where(and(tenantWhere(contactsTable.tenantId, req), eq(contactsTable.id, id))).returning();
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json({ ...contact, tags: contact.tags ?? [], createdAt: contact.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/crm/contacts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(contactsTable).where(and(tenantWhere(contactsTable.tenantId, req), eq(contactsTable.id, id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
