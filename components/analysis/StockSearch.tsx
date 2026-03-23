"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StockSearchResult } from "@/types";

interface StockSearchProps {
  onSelect: (result: StockSearchResult) => void;
  selectedTicker?: string;
}

export function StockSearch({ onSelect, selectedTicker }: StockSearchProps) {
  const [query, setQuery] = useState(selectedTicker || "");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
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

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelected(null);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = (result: StockSearchResult) => {
    setSelected(result);
    setQuery(`${result.ticker} - ${result.name}`);
    setIsOpen(false);
    onSelect(result);
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="종목 코드 또는 회사명 검색 (예: AAPL, Apple)"
          className="pl-9 pr-9 bg-[#16213e] border-white/20 text-white placeholder:text-gray-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#16213e] border border-white/10 rounded-lg overflow-hidden shadow-xl">
          <div className="max-h-60 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.ticker}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-[#4F8AFF]/20 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#4F8AFF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      {result.ticker}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.exchange}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{result.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#16213e] border border-white/10 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-400">검색 중...</p>
        </div>
      )}
    </div>
  );
}
