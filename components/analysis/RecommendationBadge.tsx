import { Badge } from "@/components/ui/badge";
import { getRecommendationText } from "@/lib/utils";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";

interface RecommendationBadgeProps {
  recommendation: Recommendation;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RecommendationBadge({
  recommendation,
  size = "md",
  className,
}: RecommendationBadgeProps) {
  const variantMap: Record<Recommendation, "buy" | "hold" | "sell"> = {
    BUY: "buy",
    HOLD: "hold",
    SELL: "sell",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5 font-bold",
  };

  return (
    <Badge
      variant={variantMap[recommendation]}
      className={cn(sizeClasses[size], className)}
    >
      {getRecommendationText(recommendation)}
    </Badge>
  );
}
