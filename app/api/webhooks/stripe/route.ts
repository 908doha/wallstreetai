import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ received: false }, { status: 503 });
}
