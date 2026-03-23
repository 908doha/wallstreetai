import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const master = await prisma.master.findUnique({
      where: { id: params.id, isActive: true },
    });

    if (!master) {
      return NextResponse.json(
        { success: false, error: "마스터를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: master });
  } catch (error) {
    console.error("Get master error:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
