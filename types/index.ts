import { Role, Recommendation, SubscriptionStatus, PaymentStatus, MasterAccess } from "@prisma/client";

export type { Role, Recommendation, SubscriptionStatus, PaymentStatus, MasterAccess };

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  subscription?: SubscriptionWithPlan | null;
}

export interface MasterData {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photoUrl: string | null;
  philosophy: string;
  quotes: string[];
  keyStocks: string[];
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuantMetrics {
  per: number | null;        // P/E Ratio
  pbr: number | null;        // P/B Ratio
  roe: number | null;        // Return on Equity (%)
  eps: number | null;        // Earnings Per Share
  revenueGrowth: number | null; // YoY Revenue Growth (%)
  debtRatio: number | null;  // Debt-to-Equity Ratio
  marketCap: number | null;  // Market Cap (USD)
  currentPrice: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  volume: number | null;
  averageVolume: number | null;
  beta: number | null;
}

// Rich Analysis Report (16-part framework)
export interface FinancialTableRow {
  label: string;
  values: string[]; // e.g. ["$1.3B", "$1.43B", "$1.61B", "+13%"]
  highlight?: boolean;
  isPositive?: boolean | null; // null = neutral
}

export interface RatioAnalysisRow {
  category: string;
  metric: string;
  currentValue: string;
  benchmark: string;
  verdict: "excellent" | "good" | "fair" | "warning" | "poor";
}

export interface MarketShareItem {
  company: string;
  share: number;
}

export interface CompetitorRow {
  company: string;
  marketShare: string;
  strength: string;
  threatLevel: "high" | "medium" | "low";
}

export interface PortersForce {
  factor: string;
  level: "low" | "medium" | "high";
  detail: string;
}

export interface RichAnalysisReport {
  // PART I: Financial Analysis
  companyOverview: {
    name: string;
    ticker: string;
    exchange: string;
    sector: string;
    description: string;
    keyStats: { label: string; value: string; highlight?: boolean }[];
  };
  financialTable: {
    periods: string[]; // e.g. ["FY22","FY23","FY24","FY25","YoY"]
    rows: FinancialTableRow[];
    summary: string;
  };
  ratioAnalysis: RatioAnalysisRow[];
  financialGrade: string;
  financialSummary: string;

  // PART II: Industry Analysis
  industryAnalysis: {
    marketPositionSummary: string;
    marketShareData: MarketShareItem[];
    competitorTable: CompetitorRow[];
    portersFiveForces: PortersForce[];
    trendSummary: string;
  };

  // SWOT
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Master Comment
  masterComment: string;

  // Investment Strategy (PART XVI)
  investmentStrategy: {
    shortTerm: string;
    midTerm: string;
    longTerm: string;
    keyRisks: string[];
    targetPrice: string;
    riskLevel: "high" | "medium" | "low";
  };

  recommendation: "BUY" | "HOLD" | "SELL";
  score: number;
  quantMetrics: Partial<QuantMetrics>;
}

export interface ClaudeRichAnalysisResponse extends RichAnalysisReport {}

export interface AnalysisResult {
  id: string;
  userId: string | null;
  masterId: string;
  ticker: string;
  companyName: string;
  recommendation: Recommendation;
  quantMetrics: QuantMetrics;
  masterComment: string;
  score: number;
  shareToken: string;
  createdAt: Date;
  master: MasterData;
  reportData?: RichAnalysisReport | null;
}

export interface SubscriptionWithPlan {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  plan: PlanData;
}

export interface PlanData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  featureConfig: PlanFeatureConfigData | null;
}

export interface PlanFeatureConfigData {
  id: string;
  planId: string;
  dailyAnalysisLimit: number;
  masterAccess: MasterAccess;
  portfolioEnabled: boolean;
  saveEnabled: boolean;
}

export interface StockData {
  ticker: string;
  companyName: string;
  currentPrice: number;
  currency: string;
  metrics: QuantMetrics;
}

export interface AnalysisRequest {
  ticker: string;
  masterId: string;
}

export interface ClaudeAnalysisResponse {
  recommendation: Recommendation;
  score: number;
  masterComment: string;
  reasoning: string;
  quantMetrics?: Partial<QuantMetrics>;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalAnalyses: number;
  analysesToday: number;
  planDistribution: {
    free: number;
    pro: number;
    premium: number;
    admin: number;
  };
  recentAnalyses: AnalysisResult[];
  topTickers: { ticker: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  subscription: SubscriptionWithPlan | null;
  _count: {
    analyses: number;
  };
}

export interface PromptVersion {
  id: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MasterPromptVersion extends PromptVersion {
  masterId: string;
}

export interface AccessControlConfig {
  planId: string;
  planName: string;
  dailyAnalysisLimit: number;
  masterAccess: MasterAccess;
  portfolioEnabled: boolean;
  saveEnabled: boolean;
}

export interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalysisListItem {
  id: string;
  ticker: string;
  companyName: string;
  recommendation: Recommendation;
  score: number;
  shareToken: string;
  createdAt: Date;
  master: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
}
