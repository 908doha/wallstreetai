"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import type { AnalysisResult, QuantMetrics } from "@/types";

interface Props {
  analysis: AnalysisResult & { master: any };
  isPro: boolean;
}

const REC_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  BUY:      { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "매수" },
  HOLD:     { bg: "bg-yellow-500/15",  text: "text-yellow-400",  label: "보유" },
  SELL:     { bg: "bg-red-500/15",     text: "text-red-400",     label: "매도" },
  STRONG_BUY:  { bg: "bg-emerald-500/20", text: "text-emerald-300", label: "강력매수" },
  STRONG_SELL: { bg: "bg-red-500/20",     text: "text-red-300",     label: "강력매도" },
};

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="text-center">
        <p className="text-[22px] font-black text-white leading-none">{score}</p>
        <p className="text-[9px] text-white/40 mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

function MetricBar({ label, value, max, unit, color }: {
  label: string; value: number | null; max: number; unit: string; color: string;
}) {
  if (value === null) return null;
  const pct = Math.min(Math.abs(value) / max * 100, 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-white/50">{label}</span>
        <span className="text-[12px] font-semibold text-white">
          {value >= 0 ? "" : "-"}{Math.abs(value).toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function PriceRange({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.min(Math.max((current - low) / (high - low) * 100, 0), 100);
  return (
    <div className="space-y-2">
      <div className="relative h-2 bg-white/[0.06] rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ef4444, #fbbf24, #34d399)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-[#0d0d1a]"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/40">
        <span>52주 최저 ${low.toFixed(0)}</span>
        <span className="text-white/70 font-semibold">${current?.toFixed(2)}</span>
        <span>52주 최고 ${high.toFixed(0)}</span>
      </div>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: QuantMetrics }) {
  const items = [
    { label: "PER",      value: metrics.per !== null ? `${metrics.per.toFixed(1)}x` : "-",    sub: "주가수익비율" },
    { label: "PBR",      value: metrics.pbr !== null ? `${metrics.pbr.toFixed(1)}x` : "-",    sub: "주가순자산비율" },
    { label: "ROE",      value: metrics.roe !== null ? `${metrics.roe.toFixed(1)}%` : "-",     sub: "자기자본이익률" },
    { label: "EPS",      value: metrics.eps !== null ? `$${metrics.eps.toFixed(2)}` : "-",    sub: "주당순이익" },
    { label: "매출성장",  value: metrics.revenueGrowth !== null ? `${metrics.revenueGrowth >= 0 ? "+" : ""}${metrics.revenueGrowth.toFixed(1)}%` : "-", sub: "YoY" },
    { label: "부채비율",  value: metrics.debtRatio !== null ? `${metrics.debtRatio.toFixed(2)}` : "-", sub: "D/E Ratio" },
    { label: "배당수익률", value: metrics.dividendYield !== null ? `${metrics.dividendYield.toFixed(2)}%` : "-", sub: "연간" },
    { label: "베타",      value: metrics.beta !== null ? metrics.beta.toFixed(2) : "-",        sub: "시장 변동성" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="bg-white/[0.04] rounded-2xl px-4 py-3">
          <p className="text-[11px] text-white/40 mb-1">{item.label}</p>
          <p className="text-[18px] font-bold text-white leading-none">{item.value}</p>
          <p className="text-[10px] text-white/30 mt-1">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function AnalysisDetailPage({ analysis, isPro }: Props) {
  const rec = REC_COLOR[analysis.recommendation] ?? REC_COLOR.HOLD;
  const m = analysis.quantMetrics as QuantMetrics;

  return (
    <div className="flex-1 pb-20">
      {/* Back nav */}
      <div className="px-4 pt-2 pb-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>
      </div>

      {/* ── 헤더 ── */}
      <div className="px-4 pb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[28px] font-black text-white">{analysis.companyName}</h1>
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${rec.bg} ${rec.text}`}>
              {rec.label}
            </span>
          </div>
          <p className="text-[13px] text-white/40">{analysis.ticker}</p>
          <div className="flex items-center gap-2 mt-2">
            {analysis.master.photoUrl ? (
              <div className="w-5 h-5 rounded-full overflow-hidden">
                <Image src={analysis.master.photoUrl} alt={analysis.master.name} width={20} height={20} className="object-cover" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#4F8AFF]/30 flex items-center justify-center text-[9px] font-bold text-[#4F8AFF]">
                {analysis.master.name.charAt(0)}
              </div>
            )}
            <span className="text-[12px] text-white/50">{analysis.master.name}의 분석</span>
          </div>
        </div>
        <ScoreRing score={analysis.score} />
      </div>

      {/* ── 거장의 한마디 ── */}
      <div className="px-4 mb-4">
        <div className="rounded-3xl p-5" style={{ background: "linear-gradient(135deg, #1a2744 0%, #0f1b35 100%)", border: "1px solid rgba(79,138,255,0.2)" }}>
          <p className="text-[11px] font-semibold text-[#4F8AFF]/80 uppercase tracking-widest mb-3">
            {analysis.master.name}의 한마디
          </p>
          <p className="text-[15px] text-white/90 leading-relaxed">
            {analysis.masterComment}
          </p>
        </div>
      </div>

      {/* ── PRO 콘텐츠 ── */}
      {isPro ? (
        <div className="px-4 space-y-4">
          {/* 52주 가격 범위 */}
          {m.fiftyTwoWeekHigh && m.fiftyTwoWeekLow && m.currentPrice && (
            <section>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">현재 주가 위치</p>
              <div className="bg-white/[0.04] rounded-3xl p-5">
                <p className="text-[13px] text-white/50 mb-4">52주 가격 범위</p>
                <PriceRange low={m.fiftyTwoWeekLow} high={m.fiftyTwoWeekHigh} current={m.currentPrice} />
              </div>
            </section>
          )}

          {/* 퀀트 지표 */}
          <section>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">핵심 지표</p>
            <MetricGrid metrics={m} />
          </section>

          {/* 수익성 바 차트 */}
          {(m.roe !== null || m.revenueGrowth !== null) && (
            <section>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">수익성 분석</p>
              <div className="bg-white/[0.04] rounded-3xl p-5 space-y-4">
                <MetricBar label="ROE (자기자본이익률)" value={m.roe} max={50} unit="%" color="#34d399" />
                <MetricBar label="매출 성장률 (YoY)" value={m.revenueGrowth} max={50} unit="%" color="#4F8AFF" />
                <MetricBar label="배당수익률" value={m.dividendYield} max={10} unit="%" color="#fbbf24" />
              </div>
            </section>
          )}

          {/* 리스크 지표 */}
          {(m.beta !== null || m.debtRatio !== null) && (
            <section>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">리스크 지표</p>
              <div className="bg-white/[0.04] rounded-3xl p-5 space-y-4">
                <MetricBar label="베타 (시장 변동성)" value={m.beta} max={3} unit="" color="#f87171" />
                <MetricBar label="부채비율 (D/E)" value={m.debtRatio} max={5} unit="" color="#fb923c" />
              </div>
            </section>
          )}

          {/* 시총 */}
          {m.marketCap && (
            <div className="bg-white/[0.04] rounded-3xl px-5 py-4 flex justify-between items-center">
              <span className="text-[13px] text-white/50">시가총액</span>
              <span className="text-[15px] font-bold text-white">
                {m.marketCap >= 1e12
                  ? `$${(m.marketCap / 1e12).toFixed(2)}T`
                  : m.marketCap >= 1e9
                  ? `$${(m.marketCap / 1e9).toFixed(1)}B`
                  : `$${(m.marketCap / 1e6).toFixed(0)}M`}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ── Free 유저: 블러 + 페이월 ── */
        <div className="relative">
          {/* 블러된 콘텐츠 미리보기 */}
          <div className="px-4 space-y-4 blur-sm pointer-events-none select-none" aria-hidden>
            <div className="grid grid-cols-2 gap-2.5">
              {["PER", "PBR", "ROE", "EPS", "매출성장", "부채비율", "배당수익률", "베타"].map((l) => (
                <div key={l} className="bg-white/[0.04] rounded-2xl px-4 py-3">
                  <p className="text-[11px] text-white/40 mb-1">{l}</p>
                  <p className="text-[18px] font-bold text-white leading-none">—</p>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.04] rounded-3xl p-5 h-28" />
            <div className="bg-white/[0.04] rounded-3xl p-5 h-24" />
          </div>

          {/* 그라데이션 페이드 + 구독 CTA */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 pt-40"
            style={{ background: "linear-gradient(to bottom, transparent 0%, #0d0d1a 40%)" }}
          >
            <div className="flex items-center gap-1.5 mb-5">
              <Lock className="w-4 h-4 text-white/40" />
              <span className="text-[12px] text-white/40">PRO 전용 분석</span>
            </div>
            <h2 className="text-[26px] font-black text-white mb-3 text-center">
              PRO를 구독하세요.
            </h2>
            <p className="text-[14px] text-white/50 text-center leading-relaxed mb-8 px-6">
              퀀트 지표, 수익성 분석, 리스크 분석 등<br />
              전문가 수준의 상세 분석을 확인하세요.
            </p>
            <Link
              href="/mypage/subscription"
              className="px-10 py-4 bg-white text-black text-[16px] font-bold rounded-full hover:bg-white/90 transition-opacity"
            >
              구독하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
