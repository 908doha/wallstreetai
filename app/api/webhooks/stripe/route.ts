import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planSlug = session.metadata?.planSlug;

  if (!userId || !planSlug || !session.subscription) return;

  const plan = await prisma.plan.findFirst({ where: { slug: planSlug } });
  if (!plan) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: "active",
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
    update: {
      planId: plan.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: "active",
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
  });

  // Update user role
  const roleMap: Record<string, "pro" | "premium"> = {
    pro: "pro",
    premium: "premium",
  };
  const newRole = roleMap[planSlug];
  if (newRole) {
    await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing" | "incomplete",
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    include: { plan: true },
  });

  if (!sub) return;

  // Find free plan
  const freePlan = await prisma.plan.findFirst({ where: { slug: "free" } });

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
      planId: freePlan?.id || sub.planId,
    },
  });

  // Downgrade role to free
  await prisma.user.update({
    where: { id: sub.userId },
    data: { role: "free" },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer || !invoice.subscription) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!sub) return;

  await prisma.paymentHistory.create({
    data: {
      userId: sub.userId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      stripePaymentIntentId: invoice.payment_intent as string,
      status: "succeeded",
      description: `구독 결제 - ${invoice.billing_reason}`,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!sub) return;

  await prisma.paymentHistory.create({
    data: {
      userId: sub.userId,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: "failed",
      description: "결제 실패",
    },
  });

  await prisma.subscription.update({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: "past_due" },
  });
}
