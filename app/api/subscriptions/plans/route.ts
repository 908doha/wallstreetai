import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: { featureConfig: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
