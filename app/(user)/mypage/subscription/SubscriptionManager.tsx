"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, getPlanDisplayName } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  featureConfig: {
    dailyAnalysisLimit: number;
    masterAccess: string;
    portfolioEnabled: boolean;
    saveEnabled: boolean;
  } | null;
}

interface SubscriptionManagerProps {
  currentPlan: Plan | null;
  plans: Plan[];
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  hasStripeSubscription: boolean;
}

export function SubscriptionManager({
  currentPlan,
  plans,
  subscriptionStatus,
  currentPeriodEnd,
  hasStripeSubscription,
}: SubscriptionManagerProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planSlug: string) => {
    setLoadingPlan(planSlug);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "오류", description: data.error, variant: "destructive" });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setLoadingPlan("portal");
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Plan Status */}
      {currentPlan && (
        <Card className="bg-gradient-to-r from-[#4F8AFF]/20 to-amber-600/20 border-[#4F8AFF]/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">현재 플랜</p>
                <p className="text-base font-bold text-white">
                  {getPlanDisplayName(currentPlan.slug)} 플랜
                </p>
                {currentPeriodEnd && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {subscriptionStatus === "canceled" ? "만료" : "갱신"}: {formatDate(currentPeriodEnd)}
                  </p>
                )}
              </div>
              {hasStripeSubscription && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#4F8AFF]/50 text-[#4F8AFF]"
                  onClick={handleManage}
                  disabled={loadingPlan === "portal"}
                >
                  {loadingPlan === "portal" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "관리하기"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.slug === plan.slug;
          const isPaid = plan.price > 0;

          return (
            <Card
              key={plan.id}
              className={`border transition-all ${
                isCurrent
                  ? "border-[#4F8AFF] bg-[#4F8AFF]/5"
                  : "border-white/10 bg-[#16213e]/80"
              }`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">
                        {getPlanDisplayName(plan.slug)}
                      </h3>
                      {isCurrent && (
                        <Badge variant="gold" className="text-[9px] px-1.5">
                          현재
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    {plan.price === 0 ? (
                      <span className="text-lg font-bold text-white">무료</span>
                    ) : (
                      <div>
                        <span className="text-lg font-bold text-[#4F8AFF]">
                          ₩{plan.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">/월</span>
                      </div>
                    )}
                  </div>
                </div>

                {plan.featureConfig && (
                  <ul className="space-y-1.5 mb-4">
                    <li className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      일일 분석 {plan.featureConfig.dailyAnalysisLimit}회
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      마스터 접근:{" "}
                      {plan.featureConfig.masterAccess === "ALL" ? "전체" : "기본"}
                    </li>
                    {plan.featureConfig.saveEnabled && (
                      <li className="flex items-center gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        분석 결과 저장
                      </li>
                    )}
                    {plan.featureConfig.portfolioEnabled && (
                      <li className="flex items-center gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        포트폴리오 기능
                      </li>
                    )}
                  </ul>
                )}

                {!isCurrent && isPaid && (
                  <Button
                    variant="gold"
                    className="w-full h-9 text-sm"
                    onClick={() => handleSubscribe(plan.slug)}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === plan.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "업그레이드"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
