import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle || null,
      ctaText: body.ctaText || null,
      ctaLink: body.ctaLink || null,
      iconUrl: body.iconUrl || null,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
