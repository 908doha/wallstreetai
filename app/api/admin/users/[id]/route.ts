import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["guest", "free", "pro", "premium", "admin"]).optional(),
  name: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: { include: { featureConfig: true } } } },
        analyses: { take: 10, orderBy: { createdAt: "desc" }, include: { master: { select: { name: true } } } },
        _count: { select: { analyses: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "사용자 없음" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: user });
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
