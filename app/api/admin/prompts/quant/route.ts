import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();
    const prompts = await prisma.quantPrompt.findMany({
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

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ success: false, error: "내용을 입력하세요" }, { status: 400 });
    }

    // Get next version number
    const lastPrompt = await prisma.quantPrompt.findFirst({
      orderBy: { version: "desc" },
    });
    const nextVersion = (lastPrompt?.version || 0) + 1;

    // Deactivate all existing prompts
    await prisma.quantPrompt.updateMany({ data: { isActive: false } });

    // Create new active prompt
    const prompt = await prisma.quantPrompt.create({
      data: {
        content,
        version: nextVersion,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: prompt });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
