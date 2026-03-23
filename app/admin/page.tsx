import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart2, TrendingUp, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { RecommendationBadge } from "@/components/analysis/RecommendationBadge";

async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersToday,
    totalAnalyses,
    analysesToday,
    planDistribution,
    recentAnalyses,
    topTickers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.analysis.count(),
    prisma.analysis.count({ where: { createdAt: { gte: today } } }),
    prisma.subscription.groupBy({
      by: ["planId"],
      _count: { planId: true },
      orderBy: { _count: { planId: "desc" } },
    }),
    prisma.analysis.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        master: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.analysis.groupBy({
      by: ["ticker"],
      _count: { ticker: true },
      orderBy: { _count: { ticker: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalUsers,
    newUsersToday,
    totalAnalyses,
    analysesToday,
    recentAnalyses,
    topTickers: topTickers.map((t) => ({
      ticker: t.ticker,
      count: t._count.ticker,
    })),
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "총 사용자",
      value: data.totalUsers.toLocaleString(),
      sub: `오늘 +${data.newUsersToday}`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/20",
    },
    {
      title: "총 분석 수",
      value: data.totalAnalyses.toLocaleString(),
      sub: `오늘 ${data.analysesToday}건`,
      icon: BarChart2,
      color: "text-green-400",
      bg: "bg-green-400/20",
    },
    {
      title: "인기 종목",
      value: data.topTickers[0]?.ticker || "-",
      sub: data.topTickers[0] ? `${data.topTickers[0].count}회 분석` : "",
      icon: TrendingUp,
      color: "text-[#f0b429]",
      bg: "bg-[#f0b429]/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-gray-400 text-sm mt-1">Wall Street AI 운영 현황</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-[#16213e]/80 border-white/10">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Tickers */}
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300">인기 종목 TOP 5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topTickers.map((item, i) => (
              <div key={item.ticker} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-4">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-white flex-1">
                  {item.ticker}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-[#f0b429] rounded-full"
                    style={{
                      width: `${Math.max(20, (item.count / (data.topTickers[0]?.count || 1)) * 100)}px`,
                    }}
                  />
                  <span className="text-xs text-gray-400">{item.count}회</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300">최근 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 py-2 pr-4">종목</th>
                  <th className="text-left text-xs text-gray-400 py-2 pr-4">추천</th>
                  <th className="text-left text-xs text-gray-400 py-2 pr-4">마스터</th>
                  <th className="text-left text-xs text-gray-400 py-2 pr-4">사용자</th>
                  <th className="text-left text-xs text-gray-400 py-2">점수</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold text-white">
                        {analysis.ticker}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <RecommendationBadge
                        recommendation={analysis.recommendation}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">
                      {analysis.master.name}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                      {analysis.user?.name || analysis.user?.email || "게스트"}
                    </td>
                    <td className="py-2.5 text-[#f0b429] font-semibold">
                      {analysis.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
