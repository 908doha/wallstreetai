import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const masters = await prisma.master.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ isPremium: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, data: masters });
  } catch (error) {
    console.error("Get masters error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
