import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  planSlug: z.enum(["pro", "premium"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
    }

    const body = await req.json();
    const { planSlug } = checkoutSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const url = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      planSlug,
      successUrl: `${baseUrl}/mypage/subscription?success=1`,
      cancelUrl: `${baseUrl}/mypage/subscription?canceled=1`,
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "올바르지 않은 플랜" }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "결제 세션 생성 실패" }, { status: 500 });
  }
}
