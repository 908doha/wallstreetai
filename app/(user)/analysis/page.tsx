"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { StockSearch } from "@/components/analysis/StockSearch";
import { MasterSelector } from "@/components/analysis/MasterSelector";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Loader2 } from "lucide-react";
import type { StockSearchResult, MasterData, AnalysisResult as AnalysisResultType } from "@/types";

export default function AnalysisPage() {
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const { toast } = useToast();

  const canAnalyze = selectedStock && selectedMaster && !isLoading;

  const handleAnalyze = async () => {
    if (!selectedStock || !selectedMaster) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: selectedStock.ticker,
          masterId: selectedMaster.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "분석 실패",
          description: data.error || "다시 시도해주세요",
          variant: "destructive",
        });
      } else {
        setResult(data.data);
      }
    } catch {
      toast({
        title: "오류",
        description: "네트워크 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TopNav title="AI 분석" showLogo={false} />

      <div className="px-4 pt-4 space-y-5">
        {/* Stock Search */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              1. 종목 선택
            </h3>
            <StockSearch
              onSelect={setSelectedStock}
              selectedTicker={selectedStock?.ticker}
            />
            {selectedStock && (
              <div className="mt-2 p-2 bg-[#f0b429]/10 rounded-lg border border-[#f0b429]/20">
                <p className="text-xs text-[#f0b429] font-medium">
                  선택됨: {selectedStock.ticker} - {selectedStock.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Master Selector */}
        <Card className="bg-[#16213e]/80 border-white/10">
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              2. 마스터 선택
            </h3>
            <MasterSelector
              onSelect={setSelectedMaster}
              selectedMasterId={selectedMaster?.id}
            />
            {selectedMaster && (
              <div className="mt-3 p-2 bg-[#f0b429]/10 rounded-lg border border-[#f0b429]/20">
                <p className="text-xs text-[#f0b429] font-medium">
                  선택됨: {selectedMaster.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analyze Button */}
        <Button
          variant="gold"
          size="lg"
          className="w-full h-12 text-base"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <BarChart2 className="w-5 h-5 mr-2" />
              AI 분석 시작
            </>
          )}
        </Button>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full bg-[#16213e]" />
            <Skeleton className="h-24 w-full bg-[#16213e]" />
            <Skeleton className="h-48 w-full bg-[#16213e]" />
          </div>
        )}

        {/* Result */}
        {result && !isLoading && <AnalysisResult analysis={result} />}
      </div>
    </div>
  );
}
