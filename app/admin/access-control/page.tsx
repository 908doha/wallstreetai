import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { getPlanDisplayName } from "@/lib/utils";
import { AccessControlForm } from "./AccessControlForm";

async function getPlansWithConfig() {
  return prisma.plan.findMany({
    include: { featureConfig: true },
    orderBy: { price: "asc" },
  });
}

export default async function AccessControlPage() {
  const plans = await getPlansWithConfig();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">접근 제어</h1>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-[#16213e]/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-white">
                {getPlanDisplayName(plan.slug)} 플랜
                <span className="text-sm text-gray-400 font-normal ml-2">
                  {plan.price === 0 ? "무료" : `₩${plan.price.toLocaleString()}/월`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.featureConfig ? (
                <AccessControlForm plan={plan} config={plan.featureConfig} />
              ) : (
                <p className="text-sm text-gray-400">설정 없음</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
