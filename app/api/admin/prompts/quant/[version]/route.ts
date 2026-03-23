import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

// POST to rollback to this version
export async function POST(
  req: NextRequest,
  { params }: { params: { version: string } }
) {
  try {
    await requireAdmin();

    const version = parseInt(params.version);
    if (isNaN(version)) {
      return NextResponse.json({ success: false, error: "올바르지 않은 버전" }, { status: 400 });
    }

    const target = await prisma.quantPrompt.findUnique({ where: { version } });
    if (!target) {
      return NextResponse.json(
        { success: false, error: "버전을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Deactivate all, activate target
    await prisma.quantPrompt.updateMany({ data: { isActive: false } });
    await prisma.quantPrompt.update({
      where: { version },
      data: { isActive: true },
    });

    return NextResponse.json({ success: true, data: target });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
