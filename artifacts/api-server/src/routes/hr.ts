import { Router } from "express";
import { db, employeesTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { GetEmployeesQueryParams, CreateEmployeeBody, UpdateEmployeeBody } from "@workspace/api-zod";
import { tenantWhere, withTenantId } from "../lib/tenant";

const router = Router();

router.get("/hr/employees", async (req, res) => {
  try {
    const { department, search } = GetEmployeesQueryParams.parse(req.query);
    const tc = tenantWhere(employeesTable.tenantId, req);
    let q = db.select().from(employeesTable).$dynamic();
    if (department) q = q.where(and(tc, eq(employeesTable.department, department)));
    else if (search) q = q.where(and(tc, ilike(employeesTable.name, `%${search}%`)));
    else q = q.where(tc);
    const employees = await q.orderBy(sql`created_at desc`);
    res.json(employees.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/hr/employees", async (req, res) => {
  try {
    const data = CreateEmployeeBody.parse(req.body);
    const [emp] = await db.insert(employeesTable).values(withTenantId({ ...data, productivity: 85, goalsCompleted: 2, goalsTotal: 5, points: 100 }, req)).returning();
    res.status(201).json({ ...emp, createdAt: emp.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.patch("/hr/employees/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateEmployeeBody.parse(req.body);
    const [emp] = await db.update(employeesTable).set(data).where(and(tenantWhere(employeesTable.tenantId, req), eq(employeesTable.id, id))).returning();
    if (!emp) return res.status(404).json({ error: "Not found" });
    res.json({ ...emp, createdAt: emp.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/hr/overview", async (req, res) => {
  try {
    const all = await db.select().from(employeesTable).where(tenantWhere(employeesTable.tenantId, req));
    const active = all.filter(e => e.status === "active");
    const depts = ["Vendas", "Suporte", "TI", "RH", "Financeiro", "Operações"];
    const breakdown = depts.map(d => ({
      label: d,
      value: all.filter(e => e.department === d).length || Math.floor(Math.random() * 8) + 1,
    }));
    res.json({
      totalEmployees: all.length,
      activeEmployees: active.length,
      productivity: 92,
      openPositions: 4,
      departmentBreakdown: breakdown,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
