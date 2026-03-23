import type { QuantMetrics as QuantMetricsType } from "@/types";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuantMetricsProps {
  metrics: QuantMetricsType;
  ticker: string;
}

interface MetricItem {
  label: string;
  value: string | null;
  description: string;
}

export function QuantMetrics({ metrics, ticker }: QuantMetricsProps) {
  const metricItems: MetricItem[] = [
    {
      label: "PER",
      value: metrics.per !== null ? `${metrics.per.toFixed(2)}배` : null,
      description: "주가수익비율",
    },
    {
      label: "PBR",
      value: metrics.pbr !== null ? `${metrics.pbr.toFixed(2)}배` : null,
      description: "주가순자산비율",
    },
    {
      label: "ROE",
      value: metrics.roe !== null ? `${metrics.roe.toFixed(2)}%` : null,
      description: "자기자본이익률",
    },
    {
      label: "EPS",
      value:
        metrics.eps !== null ? `$${metrics.eps.toFixed(2)}` : null,
      description: "주당순이익",
    },
    {
      label: "매출성장",
      value:
        metrics.revenueGrowth !== null
          ? `${metrics.revenueGrowth >= 0 ? "+" : ""}${metrics.revenueGrowth.toFixed(2)}%`
          : null,
      description: "전년대비 매출 성장률",
    },
    {
      label: "부채비율",
      value:
        metrics.debtRatio !== null ? `${metrics.debtRatio.toFixed(2)}` : null,
      description: "부채/자기자본",
    },
    {
      label: "배당수익률",
      value:
        metrics.dividendYield !== null
          ? `${metrics.dividendYield.toFixed(2)}%`
          : null,
      description: "연간 배당수익률",
    },
    {
      label: "베타",
      value: metrics.beta !== null ? metrics.beta.toFixed(2) : null,
      description: "시장 변동성",
    },
    {
      label: "시가총액",
      value:
        metrics.marketCap !== null
          ? formatNumber(metrics.marketCap)
          : null,
      description: "시가총액 (USD)",
    },
    {
      label: "52주 최고",
      value:
        metrics.fiftyTwoWeekHigh !== null
          ? `$${metrics.fiftyTwoWeekHigh.toFixed(2)}`
          : null,
      description: "52주 최고가",
    },
    {
      label: "52주 최저",
      value:
        metrics.fiftyTwoWeekLow !== null
          ? `$${metrics.fiftyTwoWeekLow.toFixed(2)}`
          : null,
      description: "52주 최저가",
    },
    {
      label: "거래량",
      value:
        metrics.volume !== null ? formatNumber(metrics.volume, 0) : null,
      description: "당일 거래량",
    },
  ];

  const availableMetrics = metricItems.filter((m) => m.value !== null);

  return (
    <Card className="bg-[#16213e]/80 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-300">
          퀀트 지표 ({ticker})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {availableMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-[#0f0f23]/60 rounded-lg p-3 border border-white/5"
            >
              <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
              <p className="text-sm font-semibold text-white">
                {metric.value}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
