import { PrismaClient } from "@prisma/client";
import { DEFAULT_QUANT_PROMPT, DEFAULT_MASTER_PROMPTS } from "../lib/claude";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Plans
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    create: {
      name: "무료",
      slug: "free",
      description: "무료로 기본 기능을 사용하세요",
      price: 0,
      currency: "KRW",
      features: ["일일 분석 3회", "기본 마스터 접근"],
    },
    update: {},
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    create: {
      name: "프로",
      slug: "pro",
      description: "더 많은 분석과 고급 기능을 사용하세요",
      price: 29900,
      currency: "KRW",
      features: ["일일 분석 20회", "전체 마스터 접근", "분석 저장"],
    },
    update: {},
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { slug: "premium" },
    create: {
      name: "프리미엄",
      slug: "premium",
      description: "무제한 분석과 포트폴리오 기능",
      price: 59900,
      currency: "KRW",
      features: ["무제한 분석", "전체 마스터 접근", "분석 저장", "포트폴리오 기능"],
    },
    update: {},
  });

  // Create PlanFeatureConfigs
  await prisma.planFeatureConfig.upsert({
    where: { planId: freePlan.id },
    create: {
      planId: freePlan.id,
      dailyAnalysisLimit: 3,
      masterAccess: "BASIC",
      portfolioEnabled: false,
      saveEnabled: false,
    },
    update: {},
  });

  await prisma.planFeatureConfig.upsert({
    where: { planId: proPlan.id },
    create: {
      planId: proPlan.id,
      dailyAnalysisLimit: 20,
      masterAccess: "ALL",
      portfolioEnabled: false,
      saveEnabled: true,
    },
    update: {},
  });

  await prisma.planFeatureConfig.upsert({
    where: { planId: premiumPlan.id },
    create: {
      planId: premiumPlan.id,
      dailyAnalysisLimit: 9999,
      masterAccess: "ALL",
      portfolioEnabled: true,
      saveEnabled: true,
    },
    update: {},
  });

  // Create Masters
  const masters = [
    {
      name: "워런 버핏",
      slug: "warren-buffett",
      bio: "오마하의 현인. 버크셔 해서웨이 CEO. 역사상 가장 성공한 가치 투자자 중 한 명으로 수십 년에 걸쳐 시장을 능가하는 수익률을 달성했습니다.",
      philosophy: "장기적 관점에서 내재 가치 대비 할인된 우량 기업에 투자합니다. 이해하기 쉬운 사업 모델, 강력한 경쟁 해자, 정직하고 유능한 경영진을 선호합니다. '좋은 기업을 적정 가격에 사는 것이 적당한 기업을 좋은 가격에 사는 것보다 훨씬 낫습니다.'",
      photoUrl: null,
      quotes: [
        "가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것입니다.",
        "주식 시장은 성급한 사람에게서 인내심 있는 사람에게로 돈을 이전하는 장치입니다.",
        "위험은 자신이 무엇을 하는지 모르는 데서 옵니다.",
        "내일 시장이 10년간 문을 닫아도 보유하고 싶지 않은 주식은 10분도 보유하지 마세요.",
      ],
      keyStocks: ["BRK.B", "AAPL", "BAC", "KO", "AXP", "OXY"],
      isActive: true,
      isPremium: false,
    },
    {
      name: "피터 린치",
      slug: "peter-lynch",
      bio: "마젤란 펀드 전설적 매니저. 1977-1990년 연평균 29.2%의 수익률을 달성한 뮤추얼 펀드의 전설. '자신이 아는 것에 투자하라'는 원칙으로 유명합니다.",
      philosophy: "일상생활에서 투자 아이디어를 발굴하고, 성장 가능성이 있는 기업을 적정 가격에 매수합니다. PEG 비율(PER/성장률)을 중요시하며, 자신이 이해하는 사업에만 투자합니다.",
      photoUrl: null,
      quotes: [
        "자신이 아는 것에 투자하라.",
        "분산투자는 무지에 대한 보호입니다. 자신이 무엇을 하는지 아는 사람에게는 별 의미가 없습니다.",
        "주식 시장에서 돈을 잃는 것은 문제가 아닙니다. 문제는 잘못된 이유로 잃는 것입니다.",
        "최고의 주식은 항상 다음 것입니다.",
      ],
      keyStocks: ["NFLX", "SBUX", "AMZN", "HD", "DIS", "WMT"],
      isActive: true,
      isPremium: false,
    },
    {
      name: "조지 소로스",
      slug: "george-soros",
      bio: "퀀텀 펀드 창립자. 반영성 이론과 거시 투자의 대가. 1992년 영국 파운드 공매도로 10억 달러를 벌어 '영국은행을 무너뜨린 사람'으로 유명합니다.",
      philosophy: "반영성 이론에 기반한 거시경제적 관점에서 투자합니다. 시장 참여자들의 편견과 비효율성을 이용하며, 잘못된 흐름을 식별하여 대규모 베팅을 합니다. 리스크 관리를 무엇보다 중시합니다.",
      photoUrl: null,
      quotes: [
        "시장은 항상 어떤 측면에서 편향되어 있습니다.",
        "내가 정말 부자가 된 것은 틀렸을 때 손실을 제한할 줄 알기 때문입니다.",
        "경제사는 어리석음, 탐욕, 공황의 연속입니다.",
        "수익이 나면 과감해지고, 손실이 나면 보수적이 되어야 합니다.",
      ],
      keyStocks: ["GLD", "SPY", "TLT", "BABA", "NIO"],
      isActive: true,
      isPremium: true,
    },
    {
      name: "레이 달리오",
      slug: "ray-dalio",
      bio: "브리지워터 어소시에이츠 창립자. 세계 최대 헤지펀드를 운영하며 '모든 날씨를 이기는 포트폴리오'와 원칙 기반 투자로 유명합니다.",
      philosophy: "경제 머신의 원리를 이해하고 데이터 기반의 원칙적 접근으로 투자합니다. 분산투자와 위험 균형(리스크 패리티)을 강조하며, 경제 사이클에 따른 자산 배분을 중시합니다.",
      photoUrl: null,
      quotes: [
        "진실은 목표를 달성하기 위해 반드시 필요한 것입니다.",
        "실수는 배움의 기회입니다.",
        "분산투자는 투자의 성배입니다.",
        "원칙 없이는 작은 어려움도 당신을 멈추게 할 것입니다.",
      ],
      keyStocks: ["GLD", "SPY", "TLT", "EEM", "VWO", "IAU"],
      isActive: true,
      isPremium: true,
    },
    {
      name: "벤저민 그레이엄",
      slug: "benjamin-graham",
      bio: "가치 투자의 아버지. '증권 분석'과 '현명한 투자자'의 저자. 워런 버핏의 스승으로 체계적인 가치 투자 방법론을 창시했습니다.",
      philosophy: "내재 가치 대비 충분한 안전 마진(margin of safety)을 확보하고 투자합니다. 미스터 마켓의 비합리성을 이용하며, 정량적 분석에 기반한 저평가 종목을 발굴합니다.",
      photoUrl: null,
      quotes: [
        "안전 마진이야말로 투자의 핵심입니다.",
        "단기적으로 주식 시장은 투표 기계이지만, 장기적으로는 무게를 재는 저울입니다.",
        "지능적인 투자자는 현실주의자로, 낙관주의자에게 팔고 비관주의자에게서 삽니다.",
        "투자자의 최대 문제이자 최대의 적은 자기 자신입니다.",
      ],
      keyStocks: ["BRK.B", "JPM", "WFC", "BAC", "T", "VZ"],
      isActive: true,
      isPremium: false,
    },
  ];

  for (const masterData of masters) {
    const master = await prisma.master.upsert({
      where: { slug: masterData.slug },
      create: masterData,
      update: {
        bio: masterData.bio,
        philosophy: masterData.philosophy,
        quotes: masterData.quotes,
        keyStocks: masterData.keyStocks,
      },
    });

    // Create default prompt for master
    const existingPrompt = await prisma.masterPrompt.findFirst({
      where: { masterId: master.id, isActive: true },
    });

    if (!existingPrompt && DEFAULT_MASTER_PROMPTS[master.slug]) {
      await prisma.masterPrompt.create({
        data: {
          masterId: master.id,
          content: DEFAULT_MASTER_PROMPTS[master.slug],
          version: 1,
          isActive: true,
        },
      });
    }

    console.log(`Master created/updated: ${masterData.name}`);
  }

  // Create default quant prompt
  const existingQuantPrompt = await prisma.quantPrompt.findFirst({
    where: { isActive: true },
  });

  if (!existingQuantPrompt) {
    await prisma.quantPrompt.create({
      data: {
        content: DEFAULT_QUANT_PROMPT,
        version: 1,
        isActive: true,
      },
    });
    console.log("Default quant prompt created");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
