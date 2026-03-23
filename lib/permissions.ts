import { auth } from "./auth";
import { prisma } from "./prisma";
import type { Role, MasterAccess } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function isPro(role: Role): boolean {
  return role === "pro" || role === "premium" || role === "admin";
}

export function isPremium(role: Role): boolean {
  return role === "premium" || role === "admin";
}

export async function getUserPlanConfig(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: {
            include: { featureConfig: true },
          },
        },
      },
    },
  });

  return user?.subscription?.plan?.featureConfig || null;
}

export async function canSaveAnalysis(userId: string): Promise<boolean> {
  const config = await getUserPlanConfig(userId);
  return config?.saveEnabled ?? false;
}

export async function canAccessPortfolio(userId: string): Promise<boolean> {
  const config = await getUserPlanConfig(userId);
  return config?.portfolioEnabled ?? false;
}

export async function getMasterAccessLevel(userId: string): Promise<MasterAccess> {
  const config = await getUserPlanConfig(userId);
  return config?.masterAccess ?? "BASIC";
}

export async function getDailyAnalysisLimit(userId: string): Promise<number> {
  const config = await getUserPlanConfig(userId);
  return config?.dailyAnalysisLimit ?? 3;
}

export function hasPermission(
  userRole: Role,
  requiredRoles: Role[]
): boolean {
  return requiredRoles.includes(userRole);
}
