import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPopularStocks } from "@/lib/stock";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { PopularTicker } from "@/components/home/PopularTicker";
import { BannerDisplay } from "@/components/home/BannerDisplay";
import { HomeMasterSection } from "@/components/home/HomeMasterSection";
import { RecommendationBadge } from "@/components/analysis/RecommendationBadge";
import { TrendingUp, BarChart2, Star, ChevronRight, Zap } from "lucide-react";
import { formatDateTime, truncate } from "@/lib/utils";

async function getHomeData() {
  try {
    const [masters, recentAnalyses, popularRaw] = await Promise.all([
      prisma.master.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { createdAt: "asc" },
      }),
      prisma.analysis.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { master: { select: { name: true, photoUrl: true } } },
      }),
      prisma.analysis.groupBy({
        by: ["ticker", "companyName"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    // Attach top recommendation per ticker
    const popularStocks = await Promise.all(
      popularRaw.map(async (row) => {
        const top = await prisma.analysis.findFirst({
          where: { ticker: row.ticker },
          orderBy: { createdAt: "desc" },
          select: { recommendation: true },
        });
        return {
          ticker: row.ticker,
          companyName: row.companyName,
          count: row._count.id,
          topRecommendation: top?.recommendation ?? undefined,
        };
      })
    );

    // DB에 분석 데이터가 없으면 하드코딩된 인기 종목으로 폴백
    const fallback = getPopularStocks().slice(0, 10).map((s) => ({
      ticker: s.ticker,
      companyName: s.name,
      count: 0,
      topRecommendation: undefined,
    }));

    return {
      masters,
      recentAnalyses,
      popularStocks: popularStocks.length > 0 ? popularStocks : fallback,
    };
  } catch {
    return { masters: [], recentAnalyses: [], popularStocks: [] };
  }
}

export default async function HomePage() {
  const session = await auth();
  const { masters, recentAnalyses, popularStocks } = await getHomeData();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <div className="flex-1 px-4 pt-4 space-y-4 pb-6">

        {/* ── 실시간 인기 종목 ticker ────────────────────── */}
        <PopularTicker stocks={popularStocks} />

        {/* ── Banner (CMS) ─────────────────────────────── */}
        <BannerDisplay />

        {/* ── Masters + 주식 입력 ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-white/90 uppercase tracking-widest">
              투자 마스터
            </h2>
            <Link
              href="/masters"
              className="text-[12px] text-[#4F8AFF]/80 flex items-center gap-0.5 hover:text-[#4F8AFF] transition-colors"
            >
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <HomeMasterSection masters={masters} />
        </div>

        {/* ── Hero ─────────────────────────────────────── */}
        <div className="relative glass-hero rounded-3xl p-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4F8AFF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-gold text-[11px] font-semibold text-[#4F8AFF] mb-4">
              <Zap className="w-3 h-3" strokeWidth={2.5} />
              AI 투자 분석
            </span>

            <h2 className="text-[22px] font-bold text-white leading-snug mb-2">
              투자 거장의 눈으로<br />
              <span className="text-gradient-gold">주식을 분석</span>하세요
            </h2>
            <p className="text-[13px] text-white/55 leading-relaxed mb-5">
              워런 버핏, 피터 린치 등 월스트리트 전설들의<br />
              투자 철학으로 AI가 종목을 분석합니다
            </p>

            <Link href="/analysis">
              <button className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-[#4F8AFF] text-white text-[14px] font-bold transition-opacity hover:opacity-90 active:opacity-75">
                <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
                지금 분석하기
              </button>
            </Link>
          </div>
        </div>

        {/* ── Sign-up prompt ───────────────────────────── */}
        {!session?.user && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 glass-gold rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-[#4F8AFF]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">무료로 시작하세요</p>
              <p className="text-[11px] text-white/50">회원가입 시 매일 3회 무료 분석</p>
            </div>
            <Link href="/auth/register">
              <span className="inline-flex h-8 px-4 items-center rounded-xl bg-[#4F8AFF] text-white text-[12px] font-bold hover:opacity-90 transition-opacity">
                시작
              </span>
            </Link>
          </div>
        )}

        {/* ── Recent Analyses ──────────────────────────── */}
        {recentAnalyses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-white/90 uppercase tracking-widest">
                최근 분석
              </h2>
            </div>
            <div className="space-y-2.5">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#4F8AFF]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-white">{analysis.ticker}</span>
                      <RecommendationBadge recommendation={analysis.recommendation} size="sm" />
                    </div>
                    <p className="text-[11px] text-white/45 truncate">
                      {truncate(analysis.companyName, 18)} · {analysis.master.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[15px] font-bold text-[#4F8AFF] leading-none mb-0.5">
                      {analysis.score}
                      <span className="text-[10px] font-normal text-[#4F8AFF]/60">점</span>
                    </p>
                    <p className="text-[10px] text-white/35">{formatDateTime(analysis.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
