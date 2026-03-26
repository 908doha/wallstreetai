import { prisma } from "./prisma";
import { runAnalysis, DEFAULT_MASTER_PROMPTS } from "./claude";
import { fetchStockDataFromYahoo } from "./yahoo-finance";
import type { AnalysisResult } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function executeAnalysis({
  ticker,
  masterId,
  userId,
}: {
  ticker: string;
  masterId: string;
  userId?: string;
}): Promise<AnalysisResult> {
  const upperTicker = ticker.toUpperCase();

  // Fetch master
  const master = await prisma.master.findUnique({
    where: { id: masterId, isActive: true },
  });
  if (!master) throw new Error("Master not found");

  // Yahoo Finance로 실시간 재무 데이터 조회
  const yahooData = await fetchStockDataFromYahoo(upperTicker);
  const companyName = yahooData.companyName !== upperTicker
    ? yahooData.companyName
    : upperTicker;

  // Get active master prompt
  const masterPromptRecord = await prisma.masterPrompt.findFirst({
    where: { masterId, isActive: true },
    orderBy: { version: "desc" },
  });
  const masterPrompt =
    masterPromptRecord?.content || DEFAULT_MASTER_PROMPTS[master.slug] || "";

  // Run Claude analysis with real financial data
  const claudeResult = await runAnalysis({
    ticker: upperTicker,
    companyName,
    masterPrompt,
    masterName: master.name,
    realDataSummary: yahooData.rawSummary,
    realMetrics: yahooData.metrics as Record<string, number | null>,
  });

  // 실제 데이터로 Claude 추정값 보정 (실제 데이터 우선)
  if (claudeResult.quantMetrics && yahooData.metrics) {
    claudeResult.quantMetrics = {
      ...claudeResult.quantMetrics,
      ...Object.fromEntries(
        Object.entries(yahooData.metrics).filter(([, v]) => v !== null && v !== undefined)
      ),
    };
  }

  // Save to database
  const analysis = await prisma.analysis.create({
    data: {
      userId: userId || null,
      masterId,
      ticker: upperTicker,
      companyName: claudeResult.companyOverview?.name || companyName,
      recommendation: claudeResult.recommendation,
      quantMetrics: (claudeResult.quantMetrics || {}) as object,
      masterComment: claudeResult.masterComment,
      score: Math.round(claudeResult.score),
      shareToken: uuidv4(),
      reportData: claudeResult as object, // 전체 리치 리포트 저장
    },
    include: { master: true },
  });

  return {
    id: analysis.id,
    userId: analysis.userId,
    masterId: analysis.masterId,
    ticker: analysis.ticker,
    companyName: analysis.companyName,
    recommendation: analysis.recommendation,
    quantMetrics: analysis.quantMetrics as unknown as import("@/types").QuantMetrics,
    masterComment: analysis.masterComment,
    score: analysis.score,
    shareToken: analysis.shareToken,
    createdAt: analysis.createdAt,
    reportData: analysis.reportData as import("@/types").RichAnalysisReport | null,
    master: {
      id: analysis.master.id,
      name: analysis.master.name,
      slug: analysis.master.slug,
      bio: analysis.master.bio,
      photoUrl: analysis.master.photoUrl,
      philosophy: analysis.master.philosophy,
      quotes: analysis.master.quotes,
      keyStocks: analysis.master.keyStocks,
      isActive: analysis.master.isActive,
      isPremium: analysis.master.isPremium,
      createdAt: analysis.master.createdAt,
      updatedAt: analysis.master.updatedAt,
    },
  };
}

export async function checkDailyLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: { include: { featureConfig: true } },
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const planConfig = user.subscription?.plan?.featureConfig;
  const dailyLimit = planConfig?.dailyAnalysisLimit ?? 3;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usedToday = await prisma.analysis.count({
    where: { userId, createdAt: { gte: today } },
  });

  return { allowed: usedToday < dailyLimit, used: usedToday, limit: dailyLimit };
}

export async function canAccessMaster(userId: string, masterId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: { include: { featureConfig: true } },
        },
      },
    },
  });

  if (!user) return false;

  const masterAccess = user.subscription?.plan?.featureConfig?.masterAccess;
  if (masterAccess === "ALL") return true;

  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: { isPremium: true },
  });

  return !master?.isPremium;
}
