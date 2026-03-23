import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "결제 기능은 현재 준비 중입니다." },
    { status: 503 }
  );
}
