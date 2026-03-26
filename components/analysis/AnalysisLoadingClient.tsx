"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const DISCLAIMERS = [
  "이 분석은 AI가 생성한 콘텐츠로, 실제 투자 조언이 아닙니다.",
  "투자의 최종 결정과 책임은 투자자 본인에게 있습니다.",
  "과거의 수익률이 미래의 수익을 보장하지 않습니다.",
  "주식 투자는 원금 손실의 위험이 있습니다.",
  "분산 투자를 통해 리스크를 줄이는 것을 권장합니다.",
  "단기 시세 차익보다 기업의 내재 가치에 집중하세요.",
  "투자하기 전 해당 기업의 사업 모델을 충분히 이해하세요.",
];

const STEPS = [
  { label: "실시간 재무 데이터 수집 중", duration: 4000 },
  { label: "퀀트 지표 분석 중", duration: 5000 },
  { label: "거장의 투자 철학 적용 중", duration: 8000 },
  { label: "분석 리포트 생성 중", duration: 0 },
];

export function AnalysisLoadingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ticker   = searchParams.get("ticker") ?? "";
  const masterId = searchParams.get("masterId") ?? "";
  const masterName = searchParams.get("masterName") ?? "거장";

  const [step, setStep] = useState(0);
  const [disclaimerIdx, setDisclaimerIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState(".");
  const hasFetched = useRef(false);

  // 점 애니메이션
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  // 면책 조항 순환
  useEffect(() => {
    const t = setInterval(() => setDisclaimerIdx((i) => (i + 1) % DISCLAIMERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // 스텝 진행
  useEffect(() => {
    let idx = 0;
    const next = () => {
      if (idx < STEPS.length - 1) {
        const dur = STEPS[idx].duration;
        idx++;
        setStep(idx);
        if (dur > 0) setTimeout(next, dur);
      }
    };
    if (STEPS[0].duration > 0) setTimeout(next, STEPS[0].duration);
  }, []);

  // 실제 분석 API 호출
  useEffect(() => {
    if (!ticker || !masterId || hasFetched.current) return;
    hasFetched.current = true;

    const run = async () => {
      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, masterId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "분석에 실패했습니다. 다시 시도해주세요.");
          return;
        }
        router.replace(`/analysis/${data.data.id}`);
      } catch {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      }
    };

    run();
  }, [ticker, masterId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-[20px] font-bold text-white mb-2">분석 실패</h2>
        <p className="text-[14px] text-white/50 mb-8 leading-relaxed">{error}</p>
        <button
          onClick={() => router.replace("/")}
          className="px-8 py-3 bg-white text-black text-[15px] font-bold rounded-full"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-between px-6 py-16">

      {/* 상단: 종목 + 거장 */}
      <div className="text-center">
        <p className="text-[13px] text-white/40 mb-1">{masterName}의 관점으로 분석 중</p>
        <h1 className="text-[32px] font-black text-white">{ticker}</h1>
      </div>

      {/* 중앙: 애니메이션 */}
      <div className="flex flex-col items-center gap-10 w-full max-w-xs">

        {/* 펄스 링 애니메이션 */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#4F8AFF]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-3 rounded-full border-2 border-[#4F8AFF]/30 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="w-20 h-20 rounded-full bg-[#4F8AFF]/10 border border-[#4F8AFF]/40 flex items-center justify-center">
            <span className="text-3xl font-black text-[#4F8AFF]">
              {ticker.charAt(0)}
            </span>
          </div>
        </div>

        {/* 스텝 진행 */}
        <div className="w-full space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500 ${
                i < step ? "bg-emerald-400" :
                i === step ? "bg-[#4F8AFF] animate-pulse" :
                "bg-white/10"
              }`} />
              <span className={`text-[13px] transition-all duration-500 ${
                i < step ? "text-emerald-400" :
                i === step ? "text-white" :
                "text-white/20"
              }`}>
                {s.label}{i === step ? dots : i < step ? " ✓" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* 진행 바 */}
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F8AFF] rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((step / (STEPS.length - 1)) * 85 + 5, 90)}%` }}
          />
        </div>
      </div>

      {/* 하단: 투자 유의사항 */}
      <div className="w-full max-w-xs text-center">
        <div className="flex items-start gap-2 bg-white/[0.04] rounded-2xl px-4 py-3">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500/60 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/35 leading-relaxed transition-all duration-700">
            {DISCLAIMERS[disclaimerIdx]}
          </p>
        </div>
      </div>

    </div>
  );
}
