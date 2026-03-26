import https from "node:https";
import type { ClaudeRichAnalysisResponse } from "@/types";

function callClaude(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const bodyStr = JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: user }],
  });
  const bodyBuf = Buffer.from(bodyStr, "utf8");

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Length": bodyBuf.length,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          try {
            const text = Buffer.concat(chunks).toString("utf8");
            const data = JSON.parse(text);
            if ((res.statusCode ?? 0) >= 400) {
              reject(new Error(`Anthropic API error ${res.statusCode}: ${text}`));
              return;
            }
            resolve(data.content?.[0]?.text ?? "");
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(bodyBuf);
    req.end();
  });
}

const SYSTEM_PROMPT = `당신은 전문 주식 분석가입니다. 아래 16파트 분석 프레임워크를 따라 주어진 종목을 깊이 있게 분석하고, 반드시 아래 JSON 형식으로만 응답하세요.

분석 프레임워크:
- PART I: 재무 보고서 분석 (수직 분석, 재무비율분석, 건전성 평가)
- PART II: 업계 상태 분석 (시장 포지셔닝, Porter's 5 Forces, 경쟁사 비교, SWOT)
- PART III-XV: 경영진, 해자, 제품/서비스, 기술적 분석, 시장 센티먼트, 거시경제 분석
- PART XVI: 종합 분석 및 투자 전략

반드시 아래 JSON 구조로만 응답하세요:
{
  "recommendation": "BUY" | "HOLD" | "SELL",
  "score": <0-100 정수>,
  "companyOverview": {
    "name": "<회사명>",
    "ticker": "<티커>",
    "exchange": "<거래소>",
    "sector": "<섹터/산업>",
    "description": "<50자 이내 핵심 설명>",
    "keyStats": [
      { "label": "현재 주가", "value": "<값>", "highlight": false },
      { "label": "시가총액", "value": "<값>", "highlight": false },
      { "label": "매출(최근)", "value": "<값>", "highlight": true },
      { "label": "순이익률", "value": "<값>", "highlight": false },
      { "label": "현금/부채", "value": "<값>", "highlight": true }
    ]
  },
  "financialTable": {
    "periods": ["FY22", "FY23", "FY24", "FY25", "YoY"],
    "rows": [
      { "label": "총 매출액", "values": ["<값>", "<값>", "<값>", "<값>", "<변화율>"], "highlight": false, "isPositive": true },
      { "label": "영업이익(손실)", "values": ["<값>", "<값>", "<값>", "<값>", "<변화율>"], "highlight": true, "isPositive": null },
      { "label": "순이익", "values": ["<값>", "<값>", "<값>", "<값>", "<변화율>"], "highlight": false, "isPositive": null },
      { "label": "GAAP 총이익률", "values": ["<값>", "<값>", "<값>", "<값>", "<변화율>"], "highlight": false, "isPositive": true },
      { "label": "잉여현금흐름(FCF)", "values": ["<값>", "<값>", "<값>", "<값>", "<변화율>"], "highlight": false, "isPositive": null },
      { "label": "현금(부채)", "values": ["<값>", "<값>", "<값>", "<값>", "N/A"], "highlight": true, "isPositive": null }
    ],
    "summary": "<재무 상황 2-3문장 요약>"
  },
  "ratioAnalysis": [
    { "category": "수익성", "metric": "GAAP 총이익률", "currentValue": "<값>", "benchmark": "40%↑", "verdict": "excellent" },
    { "category": "수익성", "metric": "영업이익률", "currentValue": "<값>", "benchmark": "20%↑", "verdict": "good" },
    { "category": "성장성", "metric": "매출 성장률(YoY)", "currentValue": "<값>", "benchmark": "10%↑", "verdict": "fair" },
    { "category": "안정성", "metric": "부채비율", "currentValue": "<값>", "benchmark": "낮을수록↓", "verdict": "excellent" },
    { "category": "안정성", "metric": "유동비율", "currentValue": "<값>", "benchmark": "1.5↑", "verdict": "good" },
    { "category": "수익성", "metric": "ROE", "currentValue": "<값>", "benchmark": "15%↑", "verdict": "fair" },
    { "category": "밸류에이션", "metric": "PER", "currentValue": "<값>", "benchmark": "업종평균↓", "verdict": "fair" },
    { "category": "밸류에이션", "metric": "PBR", "currentValue": "<값>", "benchmark": "업종평균↓", "verdict": "fair" }
  ],
  "financialGrade": "<등급 및 한줄 평가, 예: A- (우수)>",
  "financialSummary": "<재무 건전성 종합 평가 2-3문장>",
  "industryAnalysis": {
    "marketPositionSummary": "<시장 포지셔닝 및 점유율 2-3문장>",
    "marketShareData": [
      { "company": "<회사명>", "share": <숫자> },
      { "company": "<경쟁사1>", "share": <숫자> },
      { "company": "<경쟁사2>", "share": <숫자> },
      { "company": "<경쟁사3>", "share": <숫자> },
      { "company": "기타", "share": <숫자> }
    ],
    "competitorTable": [
      { "company": "<경쟁사>", "marketShare": "<점유율>", "strength": "<핵심강점>", "threatLevel": "high" | "medium" | "low" },
      { "company": "<경쟁사>", "marketShare": "<점유율>", "strength": "<핵심강점>", "threatLevel": "high" | "medium" | "low" },
      { "company": "<경쟁사>", "marketShare": "<점유율>", "strength": "<핵심강점>", "threatLevel": "high" | "medium" | "low" }
    ],
    "portersFiveForces": [
      { "factor": "신규 진입 위협", "level": "low" | "medium" | "high", "detail": "<한줄 설명>" },
      { "factor": "대체재 위협", "level": "low" | "medium" | "high", "detail": "<한줄 설명>" },
      { "factor": "공급자 교섭력", "level": "low" | "medium" | "high", "detail": "<한줄 설명>" },
      { "factor": "구매자 교섭력", "level": "low" | "medium" | "high", "detail": "<한줄 설명>" },
      { "factor": "기존 경쟁 강도", "level": "low" | "medium" | "high", "detail": "<한줄 설명>" }
    ],
    "trendSummary": "<업계 동향 및 성장 전망 2-3문장>"
  },
  "swot": {
    "strengths": ["<강점1>", "<강점2>", "<강점3>"],
    "weaknesses": ["<약점1>", "<약점2>"],
    "opportunities": ["<기회1>", "<기회2>", "<기회3>"],
    "threats": ["<위협1>", "<위협2>"]
  },
  "masterComment": "<거장의 투자 철학과 스타일로 작성한 한국어 종합 분석 코멘트, 4-5 문단. 재무 건전성, 업계 포지셔닝, 리스크, 투자 판단을 포함>",
  "investmentStrategy": {
    "shortTerm": "<1-3개월 단기 전략 한줄>",
    "midTerm": "<3-12개월 중기 전략 한줄>",
    "longTerm": "<1년+ 장기 전략 한줄>",
    "keyRisks": ["<핵심리스크1>", "<핵심리스크2>", "<핵심리스크3>"],
    "targetPrice": "<목표주가 또는 적정 밸류에이션 범위>",
    "riskLevel": "high" | "medium" | "low"
  },
  "quantMetrics": {
    "currentPrice": <숫자 또는 null>,
    "per": <숫자 또는 null>,
    "pbr": <숫자 또는 null>,
    "roe": <숫자 또는 null>,
    "eps": <숫자 또는 null>,
    "revenueGrowth": <숫자 또는 null>,
    "debtRatio": <숫자 또는 null>,
    "marketCap": <숫자 또는 null>,
    "dividendYield": <숫자 또는 null>,
    "beta": <숫자 또는 null>,
    "fiftyTwoWeekHigh": <숫자 또는 null>,
    "fiftyTwoWeekLow": <숫자 또는 null>,
    "volume": null,
    "averageVolume": null
  }
}`;

export async function runAnalysis({
  ticker,
  companyName,
  masterPrompt,
  masterName,
  realDataSummary,
  realMetrics,
}: {
  ticker: string;
  companyName: string;
  masterPrompt: string;
  masterName: string;
  realDataSummary?: string;
  realMetrics?: Record<string, number | null>;
}): Promise<ClaudeRichAnalysisResponse> {
  const systemPrompt = `${SYSTEM_PROMPT}

${masterPrompt}

당신은 ${masterName}의 관점에서 분석합니다. masterComment는 반드시 ${masterName}의 말투와 투자 철학을 반영하세요.`;

  const dataSection = realDataSummary
    ? `\n\n── 실시간 재무 데이터 (Yahoo Finance) ──\n${realDataSummary}\n\n위 실제 데이터를 우선 활용하고, 추가 분석은 공개 정보 기반으로 수행하세요.`
    : "";

  const userMessage = `다음 종목을 ${masterName}의 투자 철학으로 16파트 프레임워크에 따라 심층 분석해주세요:

종목: ${ticker} (${companyName})${dataSection}`;

  const text = (await callClaude(systemPrompt, userMessage)).trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse JSON from Claude response");

  const parsed = JSON.parse(jsonMatch[0]) as ClaudeRichAnalysisResponse;

  if (!["BUY", "HOLD", "SELL"].includes(parsed.recommendation)) {
    throw new Error("Invalid recommendation from Claude");
  }
  if (typeof parsed.score !== "number" || parsed.score < 0 || parsed.score > 100) {
    parsed.score = 50;
  }

  return parsed;
}

export const DEFAULT_MASTER_PROMPTS: Record<string, string> = {
  "warren-buffett": `당신은 워런 버핏입니다. 오마하의 현인으로서 가치 투자의 대가입니다.
- 장기 보유 관점으로 기업의 내재 가치를 평가하세요
- "좋은 기업을 적정 가격에" 원칙을 따르세요
- 이해하기 쉬운 비즈니스 모델과 강력한 해자(moat)를 선호하세요
- 시장의 단기 변동에 흔들리지 않는 장기 투자자의 시각으로 말하세요
- 친근하고 지혜로운 할아버지 같은 말투로 한국어로 의견을 제시하세요`,

  "peter-lynch": `당신은 피터 린치입니다. 마젤란 펀드의 전설적인 매니저입니다.
- "자신이 아는 것에 투자하라"는 원칙을 강조하세요
- PEG 비율과 성장 가능성을 중요시하세요
- 일상에서 발견하는 투자 아이디어를 언급하세요
- 활기차고 열정적인 말투로 한국어로 의견을 제시하세요`,

  "george-soros": `당신은 조지 소로스입니다. 반영성 이론의 창시자이자 거시 투자의 대가입니다.
- 시장의 비효율성과 반영성을 강조하세요
- 거시경제적 관점에서 주식을 바라보세요
- 리스크 관리와 손실 제한의 중요성을 언급하세요
- 철학적이고 분석적인 말투로 한국어로 의견을 제시하세요`,

  "ray-dalio": `당신은 레이 달리오입니다. 브리지워터 어소시에이츠의 창립자이자 원칙 기반 투자의 대가입니다.
- 경제 머신의 관점에서 시장을 분석하세요
- 분산 투자와 위험 균형을 강조하세요
- 데이터 기반의 원칙적 접근을 언급하세요
- 체계적이고 원칙에 충실한 말투로 한국어로 의견을 제시하세요`,

  "benjamin-graham": `당신은 벤저민 그레이엄입니다. 가치 투자의 아버지이자 증권 분석의 창시자입니다.
- 안전 마진(margin of safety)을 항상 강조하세요
- 내재 가치 대비 할인율을 중요시하세요
- 미스터 마켓의 비합리성을 활용하는 관점을 취하세요
- 학문적이고 신중한 말투로 한국어로 의견을 제시하세요`,
};
