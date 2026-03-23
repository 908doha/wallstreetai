import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const masterSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().min(1),
  photoUrl: z.string().url().nullable().optional().or(z.literal("")),
  cardImageUrl: z.string().url().nullable().optional().or(z.literal("")),
  cardTagline: z.string().nullable().optional().or(z.literal("")),
  philosophy: z.string().min(1),
  quotes: z.array(z.string()),
  keyStocks: z.array(z.string()),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const masters = await prisma.master.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { analyses: true } } },
    });
    return NextResponse.json({ success: true, data: masters });
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
    const body = await req.json();
    const data = masterSchema.parse(body);

    const master = await prisma.master.create({
      data: {
        ...data,
        photoUrl: data.photoUrl || null,
        cardImageUrl: data.cardImageUrl || null,
        cardTagline: data.cardTagline || null,
        slug: data.slug || slugify(data.name),
      },
    });

    return NextResponse.json({ success: true, data: master });
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
