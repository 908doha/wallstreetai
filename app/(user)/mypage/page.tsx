import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  History,
  CreditCard,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { getInitials, getPlanDisplayName, formatDate } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";

async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: { plan: { include: { featureConfig: true } } },
      },
      _count: { select: { analyses: true } },
    },
  });
}

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await getUserData(session.user.id);
  if (!user) redirect("/auth/login");

  const planSlug = user.subscription?.plan?.slug || "free";
  const dailyLimit = user.subscription?.plan?.featureConfig?.dailyAnalysisLimit ?? 3;

  return (
    <div>
      <TopNav title="마이페이지" showLogo={false} />

      <div className="px-4 pt-4 space-y-4">
        {/* Profile */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-[#f0b429]/30">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-[#f0b429]/20 text-[#f0b429] text-lg font-bold">
                  {user.name ? getInitials(user.name) : <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{user.name || "사용자"}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={planSlug === "free" ? "secondary" : "gold"}
                    className="text-xs"
                  >
                    {getPlanDisplayName(planSlug)} 플랜
                  </Badge>
                  <span className="text-xs text-gray-500">
                    총 {user._count.analyses}회 분석
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">구독 플랜</h3>
              <Link href="/mypage/subscription">
                <Button variant="ghost" size="sm" className="text-xs text-[#f0b429] h-7">
                  관리하기
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0f23]/60 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-semibold text-white">
                  {getPlanDisplayName(planSlug)} 플랜
                </p>
                <p className="text-xs text-gray-400">
                  일일 분석 {dailyLimit}회 제공
                </p>
                {user.subscription?.currentPeriodEnd && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    만료: {formatDate(user.subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
              {planSlug === "free" && (
                <Link href="/mypage/subscription">
                  <Button variant="gold" size="sm" className="text-xs h-8">
                    업그레이드
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="py-2">
            <Link href="/mypage/history">
              <div className="flex items-center gap-3 py-3 px-1 hover:bg-white/5 rounded-lg transition-colors">
                <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">분석 히스토리</p>
                  <p className="text-xs text-gray-400">내 분석 결과 보기</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </Link>

            <div className="h-px bg-white/5 mx-1" />

            <Link href="/mypage/subscription">
              <div className="flex items-center gap-3 py-3 px-1 hover:bg-white/5 rounded-lg transition-colors">
                <div className="w-9 h-9 bg-[#f0b429]/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#f0b429]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">구독 및 결제</p>
                  <p className="text-xs text-gray-400">플랜 변경 및 결제 관리</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <SignOutButton />
      </div>
    </div>
  );
}
