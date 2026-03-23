import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalAnalyses,
      analysesToday,
      recentAnalyses,
      topTickers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.analysis.count(),
      prisma.analysis.count({ where: { createdAt: { gte: today } } }),
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

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        totalAnalyses,
        analysesToday,
        recentAnalyses,
        topTickers: topTickers.map((t) => ({
          ticker: t.ticker,
          count: t._count.ticker,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
