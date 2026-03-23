"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BarChart2, Loader2, TrendingUp } from "lucide-react";
import { MasterCarousel } from "@/components/home/MasterCarousel";
import type { StockSearchResult } from "@/types";

interface Master {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  isPremium: boolean;
  philosophy: string;
}

interface HomeMasterSectionProps {
  masters: Master[];
}

export function HomeMasterSection({ masters }: HomeMasterSectionProps) {
  const router = useRouter();
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(
    masters[0] ?? null
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedStock(null);
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectStock = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setQuery(`${stock.ticker} · ${stock.name}`);
    setIsOpen(false);
  };

  const handleAnalyze = () => {
    if (!selectedMaster || !selectedStock) return;
    router.push(
      `/analysis?masterId=${selectedMaster.id}&ticker=${selectedStock.ticker}&company=${encodeURIComponent(selectedStock.name)}`
    );
  };

  const handleMasterChange = useCallback((master: Master) => {
    setSelectedMaster(master);
  }, []);

  const canAnalyze = !!selectedMaster && !!selectedStock;

  return (
    <section className="space-y-3">
      {/* Carousel */}
      <div className="-mx-4">
        <MasterCarousel masters={masters} onMasterChange={handleMasterChange} />
      </div>

      {/* Stock input */}
      <div ref={containerRef} className="relative">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
          {/* Selected master indicator */}
          {selectedMaster && (
            <div className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-white/50 whitespace-nowrap">
              <span className="text-white/80 font-semibold">{selectedMaster.name}</span>
              <span className="text-white/20">|</span>
            </div>
          )}

          {/* Search input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              placeholder="종목 검색 (예: AAPL, 삼성전자)"
              className="w-full bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 animate-spin" />
            )}
            {!isSearching && (
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#4F8AFF] text-white text-[12px] font-bold disabled:opacity-30 transition-opacity hover:opacity-90 active:opacity-75"
          >
            <BarChart2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            분석
          </button>
        </div>

        {/* Dropdown results */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 glass-card rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <div className="max-h-52 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.ticker}
                  onClick={() => handleSelectStock(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#4F8AFF]/15 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-[#4F8AFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-white">{r.ticker}</span>
                    <span className="text-[11px] text-white/40 ml-2 truncate">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-white/25 flex-shrink-0">{r.exchange}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
