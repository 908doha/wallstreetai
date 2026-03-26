import type { QuantMetrics } from "@/types";

export interface YahooFinanceData {
  companyName: string;
  currentPrice: number | null;
  currency: string;
  metrics: Partial<QuantMetrics>;
  rawSummary: string; // Claude에게 전달할 텍스트 요약
}

async function fetchYahoo(ticker: string, modules: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}&lang=en-US&region=US`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
    const data = await res.json();
    return data?.quoteSummary?.result?.[0];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchStockDataFromYahoo(ticker: string): Promise<YahooFinanceData> {
  const upper = ticker.toUpperCase();

  try {
    const modules = [
      "summaryDetail",
      "financialData",
      "defaultKeyStatistics",
      "assetProfile",
      "incomeStatementHistory",
    ].join(",");

    const result = await fetchYahoo(upper, modules);
    if (!result) throw new Error("No data returned");

    const summary   = result.summaryDetail || {};
    const financial = result.financialData || {};
    const keyStats  = result.defaultKeyStatistics || {};
    const profile   = result.assetProfile || {};
    const income    = result.incomeStatementHistory?.incomeStatementHistory || [];

    // 핵심 지표 추출
    const currentPrice: number | null = financial.currentPrice?.raw ?? summary.previousClose?.raw ?? null;
    const per: number | null          = summary.trailingPE?.raw ?? keyStats.trailingEps?.raw ? (currentPrice ?? 0) / (keyStats.trailingEps?.raw || 1) : null;
    const pbr: number | null          = keyStats.priceToBook?.raw ?? null;
    const roe: number | null          = financial.returnOnEquity?.raw != null ? financial.returnOnEquity.raw * 100 : null;
    const eps: number | null          = keyStats.trailingEps?.raw ?? null;
    const marketCap: number | null    = summary.marketCap?.raw ?? null;
    const dividendYield: number | null = summary.dividendYield?.raw != null ? summary.dividendYield.raw * 100 : null;
    const beta: number | null         = summary.beta?.raw ?? null;
    const fiftyTwoWeekHigh: number | null = summary.fiftyTwoWeekHigh?.raw ?? null;
    const fiftyTwoWeekLow: number | null  = summary.fiftyTwoWeekLow?.raw ?? null;
    const debtRatio: number | null    = financial.debtToEquity?.raw != null ? financial.debtToEquity.raw / 100 : null;

    // 매출 성장률 계산
    let revenueGrowth: number | null = financial.revenueGrowth?.raw != null
      ? financial.revenueGrowth.raw * 100
      : null;

    if (revenueGrowth === null && income.length >= 2) {
      const latest   = income[0]?.totalRevenue?.raw;
      const previous = income[1]?.totalRevenue?.raw;
      if (latest && previous && previous > 0) {
        revenueGrowth = ((latest - previous) / previous) * 100;
      }
    }

    const companyName = profile.longName || profile.shortName || upper;
    const currency    = financial.financialCurrency || "USD";
    const sector      = profile.sector || "";
    const industry    = profile.industry || "";
    const description = profile.longBusinessSummary?.slice(0, 400) || "";

    const metrics: Partial<QuantMetrics> = {
      currentPrice,
      per:             per !== null && isFinite(per) ? Math.round(per * 10) / 10 : null,
      pbr:             pbr !== null && isFinite(pbr) ? Math.round(pbr * 100) / 100 : null,
      roe:             roe !== null && isFinite(roe) ? Math.round(roe * 10) / 10 : null,
      eps:             eps !== null && isFinite(eps) ? Math.round(eps * 100) / 100 : null,
      revenueGrowth:   revenueGrowth !== null && isFinite(revenueGrowth) ? Math.round(revenueGrowth * 10) / 10 : null,
      debtRatio:       debtRatio !== null && isFinite(debtRatio) ? Math.round(debtRatio * 100) / 100 : null,
      marketCap:       marketCap ?? null,
      dividendYield:   dividendYield !== null && isFinite(dividendYield) ? Math.round(dividendYield * 100) / 100 : null,
      beta:            beta !== null && isFinite(beta) ? Math.round(beta * 100) / 100 : null,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      volume:          summary.volume?.raw ?? summary.averageVolume?.raw ?? null,
      averageVolume:   summary.averageVolume?.raw ?? null,
    };

    // Claude에게 전달할 구조화된 텍스트
    const lines = [
      `종목: ${upper} (${companyName})`,
      `섹터: ${sector} / 업종: ${industry}`,
      `현재 주가: ${currentPrice ? `${currency} ${currentPrice.toFixed(2)}` : "N/A"}`,
      `시가총액: ${marketCap ? formatMktCap(marketCap, currency) : "N/A"}`,
      `52주 범위: ${fiftyTwoWeekLow?.toFixed(2) ?? "?"} ~ ${fiftyTwoWeekHigh?.toFixed(2) ?? "?"}`,
      ``,
      `── 밸류에이션 ──`,
      `PER (주가수익비율): ${metrics.per ?? "N/A"}`,
      `PBR (주가순자산비율): ${metrics.pbr ?? "N/A"}`,
      `EPS (주당순이익): ${metrics.eps ?? "N/A"}`,
      ``,
      `── 수익성 ──`,
      `ROE (자기자본이익률): ${metrics.roe !== null ? `${metrics.roe}%` : "N/A"}`,
      `매출 성장률 (YoY): ${metrics.revenueGrowth !== null ? `${metrics.revenueGrowth}%` : "N/A"}`,
      ``,
      `── 재무 건전성 ──`,
      `부채비율 (D/E): ${metrics.debtRatio ?? "N/A"}`,
      `베타: ${metrics.beta ?? "N/A"}`,
      `배당수익률: ${metrics.dividendYield !== null ? `${metrics.dividendYield}%` : "N/A"}`,
    ];

    if (description) {
      lines.push(``, `── 기업 개요 ──`, description);
    }

    return {
      companyName,
      currentPrice,
      currency,
      metrics,
      rawSummary: lines.filter(Boolean).join("\n"),
    };
  } catch (err) {
    // Yahoo Finance 실패 시 빈 데이터 반환 (Claude가 자체 지식으로 분석)
    console.warn(`[Yahoo Finance] ${upper} 데이터 조회 실패:`, err);
    return {
      companyName: upper,
      currentPrice: null,
      currency: "USD",
      metrics: {},
      rawSummary: `종목: ${upper}\n(실시간 데이터 조회 불가 — 공개된 정보를 바탕으로 분석해주세요)`,
    };
  }
}

function formatMktCap(v: number, currency: string): string {
  if (v >= 1e12) return `${currency} ${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${currency} ${(v / 1e9).toFixed(1)}B`;
  return `${currency} ${(v / 1e6).toFixed(0)}M`;
}
