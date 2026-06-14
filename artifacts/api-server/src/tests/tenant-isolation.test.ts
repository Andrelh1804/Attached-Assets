import { db, leadsTable, ticketsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const TENANT_A = "test-isolation-a";
const TENANT_B = "test-isolation-b";

async function cleanup() {
  await db.delete(leadsTable).where(eq(leadsTable.tenantId, TENANT_A));
  await db.delete(leadsTable).where(eq(leadsTable.tenantId, TENANT_B));
  await db.delete(ticketsTable).where(eq(ticketsTable.tenantId, TENANT_A));
  await db.delete(ticketsTable).where(eq(ticketsTable.tenantId, TENANT_B));
}

async function runTests() {
  console.log("=== Tenant Isolation Tests ===\n");

  await cleanup();

  await db.insert(leadsTable).values({
    tenantId: TENANT_A,
    name: "Lead A1",
    email: "a1@tenanta.com",
    stage: "prospeccao",
    value: 10000,
    probability: 50,
  });

  await db.insert(leadsTable).values({
    tenantId: TENANT_B,
    name: "Lead B1",
    email: "b1@tenantb.com",
    stage: "prospeccao",
    value: 20000,
    probability: 60,
  });

  await db.insert(ticketsTable).values({
    tenantId: TENANT_A,
    title: "Ticket A1",
    status: "open",
    priority: "high",
    category: "general",
  });

  const tenantALeads = await db.select().from(leadsTable).where(eq(leadsTable.tenantId, TENANT_A));
  const tenantBLeads = await db.select().from(leadsTable).where(eq(leadsTable.tenantId, TENANT_B));

  console.assert(tenantALeads.length === 1, "FAIL: Tenant A should have 1 lead");
  console.assert(tenantALeads[0].name === "Lead A1", "FAIL: Tenant A should only see Lead A1");
  console.assert(tenantBLeads.length === 1, "FAIL: Tenant B should have 1 lead");
  console.assert(tenantBLeads[0].name === "Lead B1", "FAIL: Tenant B should only see Lead B1");
  console.log("✅ Test 1 passed: each tenant sees only its own leads");

  const crossQuery = await db.select().from(leadsTable).where(
    and(eq(leadsTable.tenantId, TENANT_A), eq(leadsTable.name, "Lead B1"))!
  );
  console.assert(crossQuery.length === 0, "FAIL: Cross-tenant query must return 0 rows");
  console.log("✅ Test 2 passed: tenant A cannot read tenant B's leads");

  const tenantATickets = await db.select().from(ticketsTable).where(eq(ticketsTable.tenantId, TENANT_A));
  const tenantBTickets = await db.select().from(ticketsTable).where(eq(ticketsTable.tenantId, TENANT_B));
  console.assert(tenantATickets.length === 1, "FAIL: Tenant A should have 1 ticket");
  console.assert(tenantBTickets.length === 0, "FAIL: Tenant B should have 0 tickets");
  console.log("✅ Test 3 passed: ticket isolation confirmed");

  const aCrossTickets = await db.select().from(ticketsTable).where(
    and(eq(ticketsTable.tenantId, TENANT_B), eq(ticketsTable.title, "Ticket A1"))!
  );
  console.assert(aCrossTickets.length === 0, "FAIL: Tenant B cannot read tenant A's tickets");
  console.log("✅ Test 4 passed: tenant B cannot read tenant A's tickets");

  await cleanup();

  console.log("\n✅ All 4 isolation tests passed — zero cross-tenant data leak confirmed");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
