import { Suspense } from "react";
import { AnalysisLoadingClient } from "@/components/analysis/AnalysisLoadingClient";

export default function AnalysisLoadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d1a]" />}>
      <AnalysisLoadingClient />
    </Suspense>
  );
}
