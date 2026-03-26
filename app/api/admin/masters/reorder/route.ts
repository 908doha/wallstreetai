import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  orders: z.array(z.object({ id: z.string(), order: z.number() })),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { orders } = reorderSchema.parse(body);

    await Promise.all(
      orders.map(({ id, order }) =>
        prisma.master.update({ where: { id }, data: { order } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
