import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { executeAnalysis, checkDailyLimit, canAccessMaster } from "@/lib/analysis";
import { z } from "zod";

const analysisSchema = z.object({
  ticker: z.string().min(1).max(10),
  masterId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { ticker, masterId } = analysisSchema.parse(body);

    // Check rate limits for authenticated users
    if (session?.user?.id) {
      const { allowed, used, limit } = await checkDailyLimit(session.user.id);
      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `일일 분석 한도(${limit}회)를 초과했습니다. 내일 다시 시도하거나 플랜을 업그레이드하세요.`,
          },
          { status: 429 }
        );
      }

      // Check master access
      const canAccess = await canAccessMaster(session.user.id, masterId);
      if (!canAccess) {
        return NextResponse.json(
          {
            success: false,
            error: "이 마스터는 프리미엄 플랜에서만 사용할 수 있습니다",
          },
          { status: 403 }
        );
      }
    } else {
      // Guest: check session-based limit (1 analysis)
      // In production, you'd track this via cookies/IP
    }

    const result = await executeAnalysis({
      ticker: ticker.toUpperCase(),
      masterId,
      userId: session?.user?.id,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "입력 데이터가 올바르지 않습니다" },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "분석 중 오류가 발생했습니다";
    console.error("Analysis error:", message, error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          master: { select: { id: true, name: true, photoUrl: true } },
        },
      }),
      prisma.analysis.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: analyses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get analyses error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
