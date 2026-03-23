import { prisma } from "./prisma";
import { searchStocks } from "./stock";
import { runAnalysis, DEFAULT_QUANT_PROMPT, DEFAULT_MASTER_PROMPTS } from "./claude";
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

  // Get company name via search (best-effort)
  let companyName = upperTicker;
  try {
    const results = await searchStocks(upperTicker);
    const match = results.find((r) => r.ticker === upperTicker);
    if (match) companyName = match.name;
  } catch {
    // fallback to ticker
  }

  // Get active quant prompt
  const quantPromptRecord = await prisma.quantPrompt.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });
  const quantPrompt = quantPromptRecord?.content || DEFAULT_QUANT_PROMPT;

  // Get active master prompt
  const masterPromptRecord = await prisma.masterPrompt.findFirst({
    where: { masterId, isActive: true },
    orderBy: { version: "desc" },
  });
  const masterPrompt =
    masterPromptRecord?.content || DEFAULT_MASTER_PROMPTS[master.slug] || "";

  // Run Claude analysis (pure LLM, no external data)
  const claudeResult = await runAnalysis({
    ticker: upperTicker,
    companyName,
    quantPrompt,
    masterPrompt,
    masterName: master.name,
  });

  // Save to database
  const analysis = await prisma.analysis.create({
    data: {
      userId: userId || null,
      masterId,
      ticker: upperTicker,
      companyName,
      recommendation: claudeResult.recommendation,
      quantMetrics: (claudeResult.quantMetrics || {}) as object,
      masterComment: claudeResult.masterComment,
      score: Math.round(claudeResult.score),
      shareToken: uuidv4(),
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
