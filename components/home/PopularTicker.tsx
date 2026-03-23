"use client";

import { useEffect, useState } from "react";
import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Stock {
  ticker: string;
  companyName: string;
  count: number;
  topRecommendation?: string;
}

interface PopularTickerProps {
  stocks: Stock[];
}

export function PopularTicker({ stocks }: PopularTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (stocks.length <= 1) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % stocks.length);
        setAnimating(false);
      }, 200);
    }, 2800);
    return () => clearInterval(interval);
  }, [stocks.length]);

  if (stocks.length === 0) return null;

  const current = stocks[currentIndex];

  const recIcon =
    current.topRecommendation === "BUY" ? (
      <TrendingUp className="w-3 h-3 text-emerald-400" />
    ) : current.topRecommendation === "SELL" ? (
      <TrendingDown className="w-3 h-3 text-red-400" />
    ) : (
      <Minus className="w-3 h-3 text-gray-400" />
    );

  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 overflow-hidden">
      {/* Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" strokeWidth={2} />
        <span className="text-[11px] font-semibold text-white/60 whitespace-nowrap">
          실시간 인기 종목
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 flex-shrink-0" />

      {/* Animated stock info */}
      <div
        className="flex-1 flex items-center gap-2 overflow-hidden transition-all duration-200"
        style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(-4px)" : "translateY(0)" }}
      >
        {/* Rank */}
        <span className="text-[11px] font-bold text-[#4F8AFF] flex-shrink-0">
          #{currentIndex + 1}
        </span>
        {/* Ticker */}
        <span className="text-[13px] font-bold text-white flex-shrink-0">
          {current.ticker}
        </span>
        {recIcon}
        {/* Company */}
        <span className="text-[11px] text-white/45 truncate">
          {current.companyName}
        </span>
      </div>

      {/* Dot indicators (up to 5 shown) */}
      <div className="flex gap-1 flex-shrink-0">
        {stocks.slice(0, Math.min(5, stocks.length)).map((_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex % Math.min(5, stocks.length) ? 12 : 5,
              height: 5,
              background:
                i === currentIndex % Math.min(5, stocks.length)
                  ? "#4F8AFF"
                  : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
