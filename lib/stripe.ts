import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLAN_PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "",
};

export async function createCheckoutSession({
  userId,
  userEmail,
  planSlug,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planSlug: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const priceId = PLAN_PRICE_IDS[planSlug];
  if (!priceId) {
    throw new Error(`No price ID found for plan: ${planSlug}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planSlug,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
        planSlug,
      },
    },
  });

  return session.url!;
}

export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId);
}
