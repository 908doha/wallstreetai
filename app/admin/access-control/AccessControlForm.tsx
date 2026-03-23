"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Save } from "lucide-react";

interface Plan {
  id: string;
  slug: string;
}

interface Config {
  id: string;
  dailyAnalysisLimit: number;
  masterAccess: "ALL" | "BASIC";
  portfolioEnabled: boolean;
  saveEnabled: boolean;
}

interface AccessControlFormProps {
  plan: Plan;
  config: Config;
}

export function AccessControlForm({ plan, config }: AccessControlFormProps) {
  const [dailyLimit, setDailyLimit] = useState(config.dailyAnalysisLimit);
  const [masterAccess, setMasterAccess] = useState<"ALL" | "BASIC">(config.masterAccess);
  const [portfolioEnabled, setPortfolioEnabled] = useState(config.portfolioEnabled);
  const [saveEnabled, setSaveEnabled] = useState(config.saveEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/access-control", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          dailyAnalysisLimit: dailyLimit,
          masterAccess,
          portfolioEnabled,
          saveEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "설정이 저장되었습니다" });
        router.refresh();
      } else {
        toast({ title: "저장 실패", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-gray-300 text-xs">일일 분석 횟수</Label>
        <Input
          type="number"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
          className="bg-[#0f0f23] border-white/10 text-white h-9"
          min={0}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300 text-xs">마스터 접근</Label>
        <div className="flex gap-2 h-9 items-center">
          <button
            type="button"
            onClick={() => setMasterAccess("BASIC")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              masterAccess === "BASIC"
                ? "bg-[#f0b429] text-[#1a1a2e] font-semibold"
                : "bg-[#0f0f23] text-gray-400 border border-white/10"
            }`}
          >
            기본
          </button>
          <button
            type="button"
            onClick={() => setMasterAccess("ALL")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              masterAccess === "ALL"
                ? "bg-[#f0b429] text-[#1a1a2e] font-semibold"
                : "bg-[#0f0f23] text-gray-400 border border-white/10"
            }`}
          >
            전체
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300 text-xs">포트폴리오</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioEnabled}
            onChange={(e) => setPortfolioEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-300">사용 가능</span>
        </label>
      </div>

      <div className="space-y-1.5">
        <Label className="text-gray-300 text-xs">분석 저장</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveEnabled}
            onChange={(e) => setSaveEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-300">사용 가능</span>
        </label>
      </div>

      <div className="col-span-2">
        <Button
          onClick={handleSave}
          variant="gold"
          size="sm"
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
