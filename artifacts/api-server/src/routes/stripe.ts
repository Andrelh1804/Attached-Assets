import { Router } from "express";
import { stripeStorage } from "../stripeStorage";
import { stripeService } from "../stripeService";

const router = Router();

router.get("/stripe/products", async (req, res) => {
  try {
    const rows = await stripeStorage.listProductsWithPrices();
    const productsMap = new Map<string, any>();
    for (const row of rows as any[]) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata,
          prices: [],
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id).prices.push({
          id: row.price_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }
    res.json({ data: Array.from(productsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/checkout", async (req, res) => {
  try {
    const { priceId, userEmail = "demo@nexora.ai", userId = "demo-user" } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "priceId is required" });
    }

    let user = await stripeStorage.getUser(userId);
    if (!user) {
      user = await stripeStorage.upsertUser(userId, { email: userEmail, name: "Demo User" });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(userEmail, userId);
      await stripeStorage.updateUserStripeInfo(userId, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0] ?? req.get("host")}`;
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/app/dashboard?subscribed=true`,
      `${baseUrl}/pricing`
    );

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/portal", async (req, res) => {
  try {
    const { userId = "demo-user" } = req.body;
    const user = await stripeStorage.getUser(userId);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0] ?? req.get("host")}`;
    const session = await stripeService.createPortalSession(user.stripeCustomerId, `${baseUrl}/pricing`);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stripe/subscription", async (req, res) => {
  try {
    const userId = (req.query.userId as string) ?? "demo-user";
    const user = await stripeStorage.getUser(userId);

    if (!user?.stripeSubscriptionId) {
      return res.json({ subscription: null, plan: user?.plan ?? "starter" });
    }

    const subscription = await stripeStorage.getSubscription(user.stripeSubscriptionId);
    res.json({ subscription, plan: user.plan ?? "starter" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
