import type { StockData, QuantMetrics, StockSearchResult } from "@/types";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

async function fetchAlphaVantage(params: Record<string, string>): Promise<unknown> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) throw new Error("ALPHA_VANTAGE_API_KEY is not set");

  const url = new URL(ALPHA_VANTAGE_BASE);
  url.searchParams.set("apikey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchStockData(ticker: string): Promise<StockData> {
  const upperTicker = ticker.toUpperCase();

  try {
    const [overviewData, quoteData] = await Promise.all([
      fetchAlphaVantage({ function: "OVERVIEW", symbol: upperTicker }),
      fetchAlphaVantage({ function: "GLOBAL_QUOTE", symbol: upperTicker }),
    ]);

    const overview = overviewData as Record<string, string>;
    const quote = (quoteData as { "Global Quote": Record<string, string> })["Global Quote"];

    if (!overview || !overview.Symbol) {
      throw new Error(`Stock ${upperTicker} not found`);
    }

    const currentPrice = parseFloat(quote?.["05. price"] || "0");
    const per = parseFloat(overview.PERatio || "0") || null;
    const pbr = parseFloat(overview.PriceToBookRatio || "0") || null;
    const roe = parseFloat(overview.ReturnOnEquityTTM || "0") || null;
    const eps = parseFloat(overview.EPS || "0") || null;
    const marketCap = parseFloat(overview.MarketCapitalization || "0") || null;
    const dividendYield = parseFloat(overview.DividendYield || "0") * 100 || null;
    const beta = parseFloat(overview.Beta || "0") || null;
    const fiftyTwoWeekHigh = parseFloat(overview["52WeekHigh"] || "0") || null;
    const fiftyTwoWeekLow = parseFloat(overview["52WeekLow"] || "0") || null;

    // Revenue growth requires income statement data
    let revenueGrowth: number | null = null;
    let debtRatio: number | null = null;

    try {
      const incomeData = await fetchAlphaVantage({
        function: "INCOME_STATEMENT",
        symbol: upperTicker,
      });
      const income = incomeData as { annualReports?: Record<string, string>[] };
      if (income.annualReports && income.annualReports.length >= 2) {
        const latest = parseFloat(income.annualReports[0].totalRevenue || "0");
        const previous = parseFloat(income.annualReports[1].totalRevenue || "0");
        if (previous > 0) {
          revenueGrowth = ((latest - previous) / previous) * 100;
        }
      }
    } catch {
      // Revenue growth unavailable
    }

    try {
      const balanceData = await fetchAlphaVantage({
        function: "BALANCE_SHEET",
        symbol: upperTicker,
      });
      const balance = balanceData as { annualReports?: Record<string, string>[] };
      if (balance.annualReports && balance.annualReports.length >= 1) {
        const report = balance.annualReports[0];
        const totalDebt = parseFloat(report.totalLiabilities || "0");
        const equity = parseFloat(report.totalShareholderEquity || "0");
        if (equity > 0) {
          debtRatio = totalDebt / equity;
        }
      }
    } catch {
      // Debt ratio unavailable
    }

    const metrics: QuantMetrics = {
      per: isFinite(per!) ? per : null,
      pbr: isFinite(pbr!) ? pbr : null,
      roe: roe !== null && isFinite(roe) ? roe * 100 : null,
      eps: isFinite(eps!) ? eps : null,
      revenueGrowth,
      debtRatio,
      marketCap: isFinite(marketCap!) ? marketCap : null,
      currentPrice: isFinite(currentPrice) ? currentPrice : null,
      dividendYield: isFinite(dividendYield!) ? dividendYield : null,
      fiftyTwoWeekHigh: isFinite(fiftyTwoWeekHigh!) ? fiftyTwoWeekHigh : null,
      fiftyTwoWeekLow: isFinite(fiftyTwoWeekLow!) ? fiftyTwoWeekLow : null,
      volume: parseInt(quote?.["06. volume"] || "0") || null,
      averageVolume: null,
      beta: isFinite(beta!) ? beta : null,
    };

    return {
      ticker: upperTicker,
      companyName: overview.Name || upperTicker,
      currentPrice: currentPrice || 0,
      currency: "USD",
      metrics,
    };
  } catch (error) {
    // Return mock data in development if API fails
    if (process.env.NODE_ENV === "development") {
      return getMockStockData(upperTicker);
    }
    throw error;
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&enableFuzzyQuery=false&lang=en-US`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error("Yahoo Finance search failed");

    const data = await res.json() as {
      quotes?: Array<{
        symbol: string;
        longname?: string;
        shortname?: string;
        exchange?: string;
        quoteType?: string;
      }>;
    };

    if (!data.quotes || data.quotes.length === 0) return [];

    return data.quotes
      .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "ETF")
      .slice(0, 10)
      .map((q) => ({
        ticker: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || "",
        type: q.quoteType || "Equity",
      }));
  } catch {
    // Fallback to popular stocks filtered list
    return getPopularStocks().filter(
      (s) =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

function getMockStockData(ticker: string): StockData {
  const mockData: Record<string, Partial<StockData>> = {
    AAPL: { companyName: "Apple Inc.", currentPrice: 195.89 },
    MSFT: { companyName: "Microsoft Corporation", currentPrice: 415.32 },
    GOOGL: { companyName: "Alphabet Inc.", currentPrice: 178.25 },
    AMZN: { companyName: "Amazon.com Inc.", currentPrice: 192.45 },
    NVDA: { companyName: "NVIDIA Corporation", currentPrice: 875.39 },
    TSLA: { companyName: "Tesla, Inc.", currentPrice: 215.66 },
    META: { companyName: "Meta Platforms Inc.", currentPrice: 526.34 },
    BRK_B: { companyName: "Berkshire Hathaway Inc.", currentPrice: 412.88 },
  };

  const known = mockData[ticker] || { companyName: ticker, currentPrice: 100.0 };

  const metrics: QuantMetrics = {
    per: 25.3,
    pbr: 7.2,
    roe: 32.5,
    eps: 6.13,
    revenueGrowth: 8.5,
    debtRatio: 1.87,
    marketCap: 3000000000000,
    currentPrice: known.currentPrice || 100,
    dividendYield: 0.52,
    fiftyTwoWeekHigh: (known.currentPrice || 100) * 1.35,
    fiftyTwoWeekLow: (known.currentPrice || 100) * 0.65,
    volume: 55412000,
    averageVolume: 59842000,
    beta: 1.21,
  };

  return {
    ticker,
    companyName: known.companyName || ticker,
    currentPrice: known.currentPrice || 100,
    currency: "USD",
    metrics,
  };
}

export function getPopularStocks(): StockSearchResult[] {
  return [
    { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "Equity" },
    { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "Equity" },
    { ticker: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE", type: "Equity" },
    { ticker: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", type: "Equity" },
    { ticker: "V", name: "Visa Inc.", exchange: "NYSE", type: "Equity" },
    { ticker: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", type: "Equity" },
    { ticker: "WMT", name: "Walmart Inc.", exchange: "NYSE", type: "Equity" },
    { ticker: "MA", name: "Mastercard Incorporated", exchange: "NYSE", type: "Equity" },
    { ticker: "PG", name: "Procter & Gamble Co.", exchange: "NYSE", type: "Equity" },
    { ticker: "DIS", name: "The Walt Disney Company", exchange: "NYSE", type: "Equity" },
    { ticker: "NFLX", name: "Netflix, Inc.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "BABA", name: "Alibaba Group", exchange: "NYSE", type: "Equity" },
    { ticker: "TSM", name: "Taiwan Semiconductor", exchange: "NYSE", type: "Equity" },
    { ticker: "ASML", name: "ASML Holding N.V.", exchange: "NASDAQ", type: "Equity" },
    { ticker: "005930.KS", name: "Samsung Electronics", exchange: "KRX", type: "Equity" },
  ];
}
