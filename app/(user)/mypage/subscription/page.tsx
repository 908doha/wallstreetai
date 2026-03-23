import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SubscriptionManager } from "./SubscriptionManager";

async function getSubscriptionData(userId: string) {
  const [user, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { plan: { include: { featureConfig: true } } },
        },
      },
    }),
    prisma.plan.findMany({
      include: { featureConfig: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return { user, plans };
}

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { user, plans } = await getSubscriptionData(session.user.id);
  if (!user) redirect("/auth/login");

  return (
    <div>
      <Header title="구독 관리" showLogo={false} />
      <div className="px-4 pt-4">
        <SubscriptionManager
          currentPlan={user.subscription?.plan || null}
          plans={plans}
          subscriptionStatus={user.subscription?.status || null}
          currentPeriodEnd={user.subscription?.currentPeriodEnd || null}
          hasStripeSubscription={!!user.subscription?.stripeSubscriptionId}
        />
      </div>
    </div>
  );
}
