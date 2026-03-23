import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationBadge } from "@/components/analysis/RecommendationBadge";
import { formatDateTime } from "@/lib/utils";
import { BarChart2 } from "lucide-react";

async function getUserAnalyses(userId: string) {
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      master: { select: { name: true, photoUrl: true } },
    },
    take: 50,
  });
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const analyses = await getUserAnalyses(session.user.id);

  return (
    <div>
      <Header title="분석 히스토리" showLogo={false} />

      <div className="px-4 pt-4 space-y-3">
        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#16213e] rounded-full flex items-center justify-center mb-4 border border-white/10">
              <BarChart2 className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mb-2">분석 이력이 없습니다</p>
            <Link href="/analysis">
              <span className="text-sm text-[#f0b429] hover:underline">
                첫 번째 분석하기
              </span>
            </Link>
          </div>
        ) : (
          analyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="bg-[#16213e]/80 border-white/10 hover:border-white/20 transition-all"
            >
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">
                        {analysis.ticker}
                      </span>
                      <RecommendationBadge
                        recommendation={analysis.recommendation}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      {analysis.companyName}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {analysis.master.name} · {formatDateTime(analysis.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#f0b429]">
                      {analysis.score}
                    </p>
                    <p className="text-[10px] text-gray-500">점수</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
