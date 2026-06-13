import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    console.log('Creating Nexora subscription plans in Stripe...');

    const plans = [
      {
        name: 'Nexora Growth',
        description: 'CRM, Mesa de Serviço, Field Service, RH, Financeiro e Omnicanal',
        monthlyPrice: 29700,
        yearlyPrice: 297000,
        metadata: { plan: 'growth', modules: 'crm,tickets,field-service,hr,finance,omnichannel' },
      },
      {
        name: 'Nexora Business',
        description: 'Tudo do Growth + Nexora Brain (IA) e Automações avançadas',
        monthlyPrice: 59700,
        yearlyPrice: 597000,
        metadata: { plan: 'business', modules: 'all' },
      },
      {
        name: 'Nexora Enterprise',
        description: 'Plataforma completa com suporte dedicado, SLAs e integrações customizadas',
        monthlyPrice: 129700,
        yearlyPrice: 1297000,
        metadata: { plan: 'enterprise', modules: 'all', support: 'dedicated' },
      },
    ];

    for (const plan of plans) {
      const existing = await stripe.products.search({ query: `name:'${plan.name}' AND active:'true'` });
      if (existing.data.length > 0) {
        console.log(`✓ ${plan.name} already exists — skipping`);
        continue;
      }

      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      });

      const monthly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'brl',
        recurring: { interval: 'month' },
        metadata: { label: 'mensal' },
      });

      const yearly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearlyPrice,
        currency: 'brl',
        recurring: { interval: 'year' },
        metadata: { label: 'anual' },
      });

      console.log(`✓ Created ${plan.name}`);
      console.log(`  Monthly: R$${plan.monthlyPrice / 100}/mês (${monthly.id})`);
      console.log(`  Yearly:  R$${plan.yearlyPrice / 100}/ano (${yearly.id})`);
    }

    console.log('\n✓ All Nexora plans created in Stripe!');
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createProducts();
