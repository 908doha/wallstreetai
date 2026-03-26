import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeAnalysisResponse } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaude(system: string, user: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function runAnalysis({
  ticker,
  companyName,
  quantPrompt,
  masterPrompt,
  masterName,
  realDataSummary,
  realMetrics,
}: {
  ticker: string;
  companyName: string;
  quantPrompt: string;
  masterPrompt: string;
  masterName: string;
  realDataSummary?: string;
  realMetrics?: Partial<import("@/types").QuantMetrics>;
}): Promise<ClaudeAnalysisResponse> {
  const systemPrompt = `${quantPrompt}

${masterPrompt}

당신은 ${masterName}의 관점에서 주식을 분석합니다. 반드시 아래 JSON 형식으로만 응답하세요:
{
  "recommendation": "BUY" | "HOLD" | "SELL",
  "score": <0-100 사이의 정수>,
  "masterComment": "<${masterName}의 말투와 스타일로 작성한 한국어 코멘트, 3-4 문단>",
  "reasoning": "<한국어로 간략한 근거>",
  "quantMetrics": {
    "per": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "pbr": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "roe": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "eps": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "revenueGrowth": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "debtRatio": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "marketCap": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "currentPrice": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "dividendYield": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "beta": <실제 데이터 우선, 없으면 추정값 또는 null>,
    "fiftyTwoWeekHigh": <실제 데이터 우선 또는 null>,
    "fiftyTwoWeekLow": <실제 데이터 우선 또는 null>,
    "volume": null,
    "averageVolume": null
  }
}`;

  const dataSection = realDataSummary
    ? `\n\n── 실시간 재무 데이터 (Yahoo Finance) ──\n${realDataSummary}\n\n위 실제 데이터를 바탕으로 분석하고, quantMetrics에는 위 데이터의 수치를 그대로 사용하세요.`
    : `\n당신이 알고 있는 이 기업의 재무 정보, 사업 모델, 경쟁력, 시장 포지션을 바탕으로 분석하고 주요 퀀트 지표를 추정하여 포함해주세요.`;

  const userMessage = `다음 종목을 ${masterName}의 투자 철학으로 분석해주세요:

종목: ${ticker} (${companyName})${dataSection}`;

  const text = (await callClaude(systemPrompt, userMessage)).trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Claude response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as ClaudeAnalysisResponse;

  if (!["BUY", "HOLD", "SELL"].includes(parsed.recommendation)) {
    throw new Error("Invalid recommendation from Claude");
  }
  if (typeof parsed.score !== "number" || parsed.score < 0 || parsed.score > 100) {
    parsed.score = 50;
  }

  return parsed;
}

export const DEFAULT_QUANT_PROMPT = `당신은 전문 주식 분석가입니다. 다음 퀀트 분석 기준을 적용하여 주식을 평가하세요:

1. 가치 평가 (PER, PBR): 업종 평균 대비 적정 수준인지 평가
2. 수익성 (ROE, EPS): 높은 ROE와 일관된 EPS 성장 선호
3. 성장성 (매출 성장률): 지속적인 성장 가능성 평가
4. 재무 건전성 (부채비율): 과도한 레버리지 경계
5. 배당 및 시장 위험 (배당수익률, 베타): 안정성 고려

각 지표를 종합적으로 분석하여 0-100점 척도로 점수를 부여하세요.
- 70점 이상: 강력 매수 추천
- 40-70점: 보유 또는 조건부 매수
- 40점 미만: 매도 또는 기피`;

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
