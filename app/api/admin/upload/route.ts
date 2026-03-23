import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "masters";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "파일이 없습니다" }, { status: 400 });
    }

    // 파일 타입 검사
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드 가능합니다" }, { status: 400 });
    }

    // 파일 크기 제한: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `card-images/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      // 버킷이 없으면 생성 후 재시도
      if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
        await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
        const { error: retryError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, buffer, { contentType: file.type, upsert: false });
        if (retryError) {
          return NextResponse.json({ success: false, error: retryError.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "권한 없음" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
