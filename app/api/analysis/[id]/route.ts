import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get("share");

    let analysis;

    if (shareToken) {
      analysis = await prisma.analysis.findUnique({
        where: { shareToken },
        include: { master: true },
      });
    } else {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "인증 필요" },
          { status: 401 }
        );
      }

      analysis = await prisma.analysis.findUnique({
        where: {
          id,
          userId: session.user.role === "admin" ? undefined : session.user.id,
        },
        include: { master: true },
      });
    }

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "분석을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Get analysis error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
