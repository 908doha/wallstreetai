import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/layout/TopNav";
import { AnalysisDetailPage } from "@/components/analysis/AnalysisDetailPage";

async function getAnalysis(id: string, userId?: string) {
  return prisma.analysis.findUnique({
    where: { id },
    include: { master: true },
  });
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const analysis = await getAnalysis(id);
  if (!analysis) notFound();

  const isPro =
    session?.user?.role === "pro" ||
    session?.user?.role === "premium" ||
    session?.user?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <AnalysisDetailPage analysis={analysis as any} isPro={isPro} />
    </div>
  );
}
