import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationBadge } from "@/components/analysis/RecommendationBadge";
import { TrendingUp, BarChart2, Star, ChevronRight } from "lucide-react";
import { formatDateTime, truncate } from "@/lib/utils";

async function getHomeData() {
  const [masters, recentAnalyses] = await Promise.all([
    prisma.master.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "asc" },
    }),
    prisma.analysis.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { master: { select: { name: true, photoUrl: true } } },
    }),
  ]);

  return { masters, recentAnalyses };
}

export default async function HomePage() {
  const session = await auth();
  const { masters, recentAnalyses } = await getHomeData();

  return (
    <div>
      <Header />

      <div className="px-4 pt-4 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#16213e] to-[#1a1a2e] rounded-2xl p-5 border border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0b429]/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#f0b429] rounded-md flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#1a1a2e]" strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-[#f0b429]">Wall Street AI</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              투자 거장의 눈으로<br />주식을 분석하세요
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              워런 버핏, 피터 린치 등 월스트리트 전설들의<br />투자 철학으로 AI가 종목을 분석합니다
            </p>
            <Link href="/analysis">
              <Button variant="gold" size="sm" className="h-9">
                <BarChart2 className="w-4 h-4 mr-2" />
                지금 분석하기
              </Button>
            </Link>
          </div>
        </div>

        {/* Masters */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">투자 마스터</h2>
            <Link href="/masters" className="text-xs text-[#f0b429] flex items-center gap-0.5">
              전체보기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {masters.map((master) => (
              <Link key={master.id} href={`/masters/${master.id}`}>
                <div className="flex flex-col items-center gap-2 w-16 flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#f0b429]/20 border border-[#f0b429]/30 flex items-center justify-center overflow-hidden">
                    {master.photoUrl ? (
                      <Image
                        src={master.photoUrl}
                        alt={master.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-[#f0b429]">
                        {master.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300 text-center leading-tight">
                    {master.name.split(" ").slice(-1)[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Banner */}
        {!session?.user && (
          <Card className="bg-gradient-to-r from-[#f0b429]/20 to-amber-600/20 border-[#f0b429]/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0b429]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-[#f0b429]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">무료로 시작하세요</p>
                  <p className="text-xs text-gray-300">회원가입 시 매일 3회 무료 분석</p>
                </div>
                <Link href="/auth/register">
                  <Button variant="gold" size="sm" className="text-xs h-8">
                    시작하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">최근 분석</h2>
            </div>
            <div className="space-y-2">
              {recentAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="bg-[#16213e]/80 border-white/10"
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">
                            {analysis.ticker}
                          </span>
                          <RecommendationBadge
                            recommendation={analysis.recommendation}
                            size="sm"
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          {truncate(analysis.companyName, 20)} · {analysis.master.name}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-bold text-[#f0b429]">
                          {analysis.score}점
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatDateTime(analysis.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
