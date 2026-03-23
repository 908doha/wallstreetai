"use client";

import { formatDateTime } from "@/lib/utils";
import { RecommendationBadge } from "./RecommendationBadge";
import { ScoreDisplay } from "./ScoreDisplay";
import { QuantMetrics } from "./QuantMetrics";
import { ShareButton } from "./ShareButton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AnalysisResult as AnalysisResultType } from "@/types";

interface AnalysisResultProps {
  analysis: AnalysisResultType;
  showShare?: boolean;
}

export function AnalysisResult({ analysis, showShare = true }: AnalysisResultProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Card */}
      <Card className="bg-[#16213e]/80 border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#4F8AFF] to-amber-600" />
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {analysis.ticker}
                </h2>
                <RecommendationBadge
                  recommendation={analysis.recommendation}
                  size="lg"
                />
              </div>
              <p className="text-sm text-gray-400">{analysis.companyName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(analysis.createdAt)}
              </p>
            </div>
            <ScoreDisplay score={analysis.score} size={80} />
          </div>

          {/* Master info */}
          <div className="flex items-center gap-3 p-3 bg-[#0f0f23]/60 rounded-lg border border-white/5">
            <Avatar className="w-10 h-10 border border-[#4F8AFF]/30">
              <AvatarImage
                src={analysis.master.photoUrl || ""}
                alt={analysis.master.name}
              />
              <AvatarFallback className="bg-[#4F8AFF]/20 text-[#4F8AFF] text-sm font-bold">
                {analysis.master.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gray-400">분석 마스터</p>
              <p className="text-sm font-semibold text-white">
                {analysis.master.name}
              </p>
            </div>
            {showShare && (
              <div className="ml-auto">
                <ShareButton
                  shareToken={analysis.shareToken}
                  ticker={analysis.ticker}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Master Comment */}
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#4F8AFF] rounded-full" />
            <h3 className="text-sm font-semibold text-gray-300">
              {analysis.master.name}의 분석
            </h3>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis.masterComment}
          </p>
        </CardContent>
      </Card>

      {/* Quant Metrics */}
      <QuantMetrics metrics={analysis.quantMetrics} ticker={analysis.ticker} />
    </div>
  );
}
