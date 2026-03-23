import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const configSchema = z.object({
  planId: z.string(),
  dailyAnalysisLimit: z.number().int().min(0),
  masterAccess: z.enum(["ALL", "BASIC"]),
  portfolioEnabled: z.boolean(),
  saveEnabled: z.boolean(),
});

export async function GET() {
  try {
    await requireAdmin();
    const configs = await prisma.planFeatureConfig.findMany({
      include: { plan: true },
    });
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = configSchema.parse(body);

    const config = await prisma.planFeatureConfig.upsert({
      where: { planId: data.planId },
      create: data,
      update: {
        dailyAnalysisLimit: data.dailyAnalysisLimit,
        masterAccess: data.masterAccess,
        portfolioEnabled: data.portfolioEnabled,
        saveEnabled: data.saveEnabled,
      },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "입력 오류" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
