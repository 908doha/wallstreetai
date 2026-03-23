import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "ko-KR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (Math.abs(num) >= 1e12) {
    return `${(num / 1e12).toFixed(1)}T`;
  }
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  }
  return num.toFixed(decimals);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, locale: string = "ko-KR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: string = "ko-KR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateShareUrl(shareToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/analysis/share/${shareToken}`;
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case "BUY":
      return "text-green-400";
    case "SELL":
      return "text-red-400";
    case "HOLD":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}

export function getRecommendationBgColor(recommendation: string): string {
  switch (recommendation) {
    case "BUY":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "SELL":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "HOLD":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f0b429";
  return "#ef4444";
}

export function getRecommendationText(recommendation: string): string {
  switch (recommendation) {
    case "BUY":
      return "매수";
    case "SELL":
      return "매도";
    case "HOLD":
      return "보유";
    default:
      return recommendation;
  }
}

export function getPlanDisplayName(slug: string): string {
  const names: Record<string, string> = {
    free: "무료",
    pro: "프로",
    premium: "프리미엄",
    admin: "관리자",
  };
  return names[slug] || slug;
}

export function getRoleDisplayName(role: string): string {
  const names: Record<string, string> = {
    guest: "게스트",
    free: "무료",
    pro: "프로",
    premium: "프리미엄",
    admin: "관리자",
  };
  return names[role] || role;
}

export function isValidTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(ticker.toUpperCase());
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
