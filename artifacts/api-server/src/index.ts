import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { db, companiesTable, tenantSettingsTable } from "@workspace/db";

async function initStripe() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set — skipping Stripe init");
    return;
  }

  try {
    logger.info("Running Stripe migrations…");
    await runMigrations({ databaseUrl, schema: "stripe" });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();
    const webhookBaseUrl = `https://${process.env["REPLIT_DOMAINS"]?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`);
    logger.info("Stripe webhook configured");

    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe backfill complete"))
      .catch((err: Error) => logger.error({ err }, "Stripe backfill error"));
  } catch (err: any) {
    logger.warn({ msg: err.message }, "Stripe init skipped — integration not connected yet");
  }
}

async function initDefaultTenant() {
  try {
    await db
      .insert(companiesTable)
      .values({ id: "default", name: "Nexora Demo", plan: "enterprise", status: "active" })
      .onConflictDoNothing();
    await db
      .insert(tenantSettingsTable)
      .values({ tenantId: "default", featureFlags: {}, branding: {}, limits: {} })
      .onConflictDoNothing();
    logger.info("Default tenant bootstrapped");
  } catch (err: any) {
    logger.error({ err }, "Default tenant bootstrap error");
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();
await initDefaultTenant();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
