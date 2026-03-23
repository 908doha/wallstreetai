"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, X, Save } from "lucide-react";
import type { MasterData } from "@/types";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  slug: z.string().min(1, "슬러그를 입력하세요"),
  bio: z.string().min(10, "소개를 입력하세요"),
  photoUrl: z.string().url("올바른 URL을 입력하세요").optional().or(z.literal("")),
  cardImageUrl: z.string().url("올바른 URL을 입력하세요").optional().or(z.literal("")),
  cardTagline: z.string().optional().or(z.literal("")),
  philosophy: z.string().min(10, "투자 철학을 입력하세요"),
  isPremium: z.boolean(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface MasterFormProps {
  master?: MasterData;
}

export function MasterForm({ master }: MasterFormProps) {
  const [quotes, setQuotes] = useState<string[]>(master?.quotes || [""]);
  const [keyStocks, setKeyStocks] = useState<string[]>(master?.keyStocks || [""]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: master?.name || "",
      slug: master?.slug || "",
      bio: master?.bio || "",
      photoUrl: master?.photoUrl || "",
      cardImageUrl: (master as MasterData & { cardImageUrl?: string })?.cardImageUrl || "",
      cardTagline: (master as MasterData & { cardTagline?: string })?.cardTagline || "",
      philosophy: master?.philosophy || "",
      isPremium: master?.isPremium || false,
      isActive: master?.isActive ?? true,
    },
  });

  const cardImageUrlVal = watch("cardImageUrl");
  const cardTaglineVal = watch("cardTagline");
  const nameVal = watch("name");
  const bio = watch("bio");

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const url = master
        ? `/api/admin/masters/${master.id}`
        : "/api/admin/masters";
      const method = master ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photoUrl: data.photoUrl || null,
          cardImageUrl: data.cardImageUrl || null,
          cardTagline: data.cardTagline || null,
          quotes: quotes.filter((q) => q.trim()),
          keyStocks: keyStocks.filter((s) => s.trim()),
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast({ title: master ? "수정되었습니다" : "생성되었습니다" });
        router.push("/admin/masters");
        router.refresh();
      } else {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-gray-300">이름 *</Label>
          <Input
            {...register("name")}
            className="bg-[#0f0f23] border-white/10 text-white"
            placeholder="워런 버핏"
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-300">슬러그 *</Label>
          <Input
            {...register("slug")}
            className="bg-[#0f0f23] border-white/10 text-white"
            placeholder="warren-buffett"
          />
          {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
        </div>
      </div>

      {/* 프로필 사진 */}
      <div className="space-y-1.5">
        <ImageUploader
          label="프로필 사진"
          hint="(아바타에 사용)"
          value={watch("photoUrl") || ""}
          onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
          previewHeight={160}
        />
      </div>

      {/* 카드 배경 이미지 */}
      <div className="space-y-1.5">
        <ImageUploader
          label="카드 배경 이미지"
          hint="(홈 화면 대형 카드 · 권장 비율 3:4)"
          value={cardImageUrlVal || ""}
          onChange={(url) => setValue("cardImageUrl", url, { shouldValidate: true })}
          previewHeight={240}
          overlayText={{
            title: nameVal || "마스터 이름",
            subtitle: cardTaglineVal || bio || "태그라인",
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300">
          카드 태그라인
          <span className="text-[11px] text-gray-500 ml-2 font-normal">(카드 하단에 표시되는 짧은 문구)</span>
        </Label>
        <Input
          {...register("cardTagline")}
          className="bg-[#0f0f23] border-white/10 text-white"
          placeholder="예: 가치투자의 전설, 오마하의 현인"
          maxLength={60}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300">소개 *</Label>
        <Textarea
          {...register("bio")}
          className="bg-[#0f0f23] border-white/10 text-white min-h-[80px]"
          placeholder="투자 거장 소개..."
        />
        {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300">투자 철학 *</Label>
        <Textarea
          {...register("philosophy")}
          className="bg-[#0f0f23] border-white/10 text-white min-h-[120px]"
          placeholder="투자 철학 설명..."
        />
        {errors.philosophy && <p className="text-xs text-red-400">{errors.philosophy.message}</p>}
      </div>

      {/* Quotes */}
      <div className="space-y-2">
        <Label className="text-gray-300">명언</Label>
        {quotes.map((quote, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={quote}
              onChange={(e) => {
                const updated = [...quotes];
                updated[i] = e.target.value;
                setQuotes(updated);
              }}
              className="bg-[#0f0f23] border-white/10 text-white"
              placeholder={`명언 ${i + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-400"
              onClick={() => setQuotes(quotes.filter((_, j) => j !== i))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 text-gray-400"
          onClick={() => setQuotes([...quotes, ""])}
        >
          <Plus className="w-4 h-4 mr-1" />
          명언 추가
        </Button>
      </div>

      {/* Key Stocks */}
      <div className="space-y-2">
        <Label className="text-gray-300">주요 투자 종목</Label>
        <div className="flex flex-wrap gap-2">
          {keyStocks.map((stock, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                value={stock}
                onChange={(e) => {
                  const updated = [...keyStocks];
                  updated[i] = e.target.value;
                  setKeyStocks(updated);
                }}
                className="bg-[#0f0f23] border-white/10 text-white w-24 text-xs"
                placeholder="AAPL"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-red-400"
                onClick={() => setKeyStocks(keyStocks.filter((_, j) => j !== i))}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-400 h-9"
            onClick={() => setKeyStocks([...keyStocks, ""])}
          >
            <Plus className="w-3 h-3 mr-1" />
            추가
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("isPremium")}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-300">프리미엄 마스터</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-300">활성화</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-white/20"
          onClick={() => router.push("/admin/masters")}
        >
          취소
        </Button>
        <Button type="submit" variant="gold" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
