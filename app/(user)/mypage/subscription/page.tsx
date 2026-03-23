import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Clock } from "lucide-react";

async function getCurrentPlan(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });
    return user?.subscription?.plan || null;
  } catch {
    return null;
  }
}

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const currentPlan = await getCurrentPlan(session.user.id);

  return (
    <div>
      <TopNav title="구독 관리" showLogo={false} />
      <div className="px-4 pt-4 space-y-4">
        {/* 현재 플랜 */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0b429]/20 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#f0b429]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">현재 플랜</p>
                <p className="text-base font-bold text-white">
                  {currentPlan?.name || "무료"}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto border-[#f0b429]/50 text-[#f0b429] text-xs">
                이용중
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 준비중 안내 */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">결제 기능 준비 중</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                구독 플랜 결제 기능은 현재 준비 중입니다.<br />
                곧 프로 및 프리미엄 플랜을 이용하실 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 플랜 미리보기 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 px-1">출시 예정 플랜</p>
          {[
            { name: "프로", price: "29,900원", features: ["일일 분석 20회", "전체 거장 접근", "분석 저장"] },
            { name: "프리미엄", price: "59,900원", features: ["무제한 분석", "전체 거장 접근", "분석 저장", "포트폴리오"] },
          ].map((plan) => (
            <Card key={plan.name} className="bg-[#16213e]/50 border-white/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{plan.name}</span>
                  <span className="text-xs text-[#f0b429] font-medium">{plan.price}/월</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((f) => (
                    <span key={f} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
