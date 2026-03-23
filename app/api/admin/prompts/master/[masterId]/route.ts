import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ masterId: string }> }
) {
  try {
    const { masterId } = await params;
    await requireAdmin();

    const prompts = await prisma.masterPrompt.findMany({
      where: { masterId },
      orderBy: { version: "desc" },
    });

    return NextResponse.json({ success: true, data: prompts });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ masterId: string }> }
) {
  try {
    const { masterId } = await params;
    await requireAdmin();
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ success: false, error: "내용을 입력하세요" }, { status: 400 });
    }

    const lastPrompt = await prisma.masterPrompt.findFirst({
      where: { masterId },
      orderBy: { version: "desc" },
    });
    const nextVersion = (lastPrompt?.version || 0) + 1;

    await prisma.masterPrompt.updateMany({
      where: { masterId },
      data: { isActive: false },
    });

    const prompt = await prisma.masterPrompt.create({
      data: { masterId, content, version: nextVersion, isActive: true },
    });

    return NextResponse.json({ success: true, data: prompt });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
