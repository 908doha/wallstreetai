import { NextRequest, NextResponse } from "next/server";
import { searchStocks, getPopularStocks } from "@/lib/stock";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 1) {
      return NextResponse.json({
        success: true,
        data: getPopularStocks().slice(0, 10),
      });
    }

    const results = await searchStocks(query.trim());
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Stock search error:", error);
    return NextResponse.json({ success: false, error: "검색 오류" }, { status: 500 });
  }
}
