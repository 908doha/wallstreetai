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
