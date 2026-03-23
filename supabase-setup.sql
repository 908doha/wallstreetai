-- ============================================================
-- Wall Street AI — Supabase Setup SQL
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- ============================================================

-- ▌1. ENUMS
CREATE TYPE "Role" AS ENUM ('guest', 'free', 'pro', 'premium', 'admin');
CREATE TYPE "Recommendation" AS ENUM ('BUY', 'HOLD', 'SELL');
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE "MasterAccess" AS ENUM ('ALL', 'BASIC');

-- ▌2. TABLES

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'free',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "masters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "philosophy" TEXT NOT NULL,
    "quotes" TEXT[],
    "keyStocks" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "masters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "master_prompts" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "master_prompts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quant_prompts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quant_prompts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "masterId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "quantMetrics" JSONB NOT NULL,
    "masterComment" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "features" TEXT[],
    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plan_feature_configs" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dailyAnalysisLimit" INTEGER NOT NULL,
    "masterAccess" "MasterAccess" NOT NULL DEFAULT 'BASIC',
    "portfolioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "saveEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "plan_feature_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "stripePaymentIntentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- ▌3. INDEXES

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "masters_slug_key" ON "masters"("slug");
CREATE UNIQUE INDEX "master_prompts_masterId_version_key" ON "master_prompts"("masterId", "version");
CREATE UNIQUE INDEX "quant_prompts_version_key" ON "quant_prompts"("version");
CREATE UNIQUE INDEX "analyses_shareToken_key" ON "analyses"("shareToken");
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
CREATE UNIQUE INDEX "plan_feature_configs_planId_key" ON "plan_feature_configs"("planId");
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
CREATE UNIQUE INDEX "payment_history_stripePaymentIntentId_key" ON "payment_history"("stripePaymentIntentId");

-- ▌4. FOREIGN KEYS

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "master_prompts" ADD CONSTRAINT "master_prompts_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "plan_feature_configs" ADD CONSTRAINT "plan_feature_configs_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ▌5. SEED DATA

-- Plans
INSERT INTO "plans" ("id","name","slug","description","price","currency","features") VALUES
  ('plan_free','무료','free','무료로 기본 기능을 사용하세요',0,'KRW',ARRAY['일일 분석 3회','기본 마스터 접근']),
  ('plan_pro','프로','pro','더 많은 분석과 고급 기능을 사용하세요',29900,'KRW',ARRAY['일일 분석 20회','전체 마스터 접근','분석 저장']),
  ('plan_premium','프리미엄','premium','무제한 분석과 포트폴리오 기능',59900,'KRW',ARRAY['무제한 분석','전체 마스터 접근','분석 저장','포트폴리오 기능']);

-- Plan Feature Configs
INSERT INTO "plan_feature_configs" ("id","planId","dailyAnalysisLimit","masterAccess","portfolioEnabled","saveEnabled") VALUES
  ('pfc_free','plan_free',3,'BASIC',false,false),
  ('pfc_pro','plan_pro',20,'ALL',false,true),
  ('pfc_premium','plan_premium',9999,'ALL',true,true);

-- Masters
INSERT INTO "masters" ("id","name","slug","bio","philosophy","quotes","keyStocks","isActive","isPremium","createdAt","updatedAt") VALUES
(
  'master_buffett','워런 버핏','warren-buffett',
  '오마하의 현인. 버크셔 해서웨이 CEO. 역사상 가장 성공한 가치 투자자 중 한 명으로 수십 년에 걸쳐 시장을 능가하는 수익률을 달성했습니다.',
  '장기적 관점에서 내재 가치 대비 할인된 우량 기업에 투자합니다. 이해하기 쉬운 사업 모델, 강력한 경쟁 해자, 정직하고 유능한 경영진을 선호합니다.',
  ARRAY['가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것입니다.','주식 시장은 성급한 사람에게서 인내심 있는 사람에게로 돈을 이전하는 장치입니다.','위험은 자신이 무엇을 하는지 모르는 데서 옵니다.','내일 시장이 10년간 문을 닫아도 보유하고 싶지 않은 주식은 10분도 보유하지 마세요.'],
  ARRAY['BRK.B','AAPL','BAC','KO','AXP','OXY'],
  true,false,NOW(),NOW()
),
(
  'master_lynch','피터 린치','peter-lynch',
  '마젤란 펀드 전설적 매니저. 1977-1990년 연평균 29.2%의 수익률을 달성한 뮤추얼 펀드의 전설.',
  '일상생활에서 투자 아이디어를 발굴하고, 성장 가능성이 있는 기업을 적정 가격에 매수합니다. PEG 비율(PER/성장률)을 중요시합니다.',
  ARRAY['자신이 아는 것에 투자하라.','분산투자는 무지에 대한 보호입니다.','주식 시장에서 돈을 잃는 것은 문제가 아닙니다. 문제는 잘못된 이유로 잃는 것입니다.','최고의 주식은 항상 다음 것입니다.'],
  ARRAY['NFLX','SBUX','AMZN','HD','DIS','WMT'],
  true,false,NOW(),NOW()
),
(
  'master_soros','조지 소로스','george-soros',
  '퀀텀 펀드 창립자. 반영성 이론과 거시 투자의 대가. 1992년 영국 파운드 공매도로 10억 달러를 벌어 유명합니다.',
  '반영성 이론에 기반한 거시경제적 관점에서 투자합니다. 시장 참여자들의 편견과 비효율성을 이용하며 리스크 관리를 무엇보다 중시합니다.',
  ARRAY['시장은 항상 어떤 측면에서 편향되어 있습니다.','내가 정말 부자가 된 것은 틀렸을 때 손실을 제한할 줄 알기 때문입니다.','경제사는 어리석음, 탐욕, 공황의 연속입니다.','수익이 나면 과감해지고, 손실이 나면 보수적이 되어야 합니다.'],
  ARRAY['GLD','SPY','TLT','BABA','NIO'],
  true,true,NOW(),NOW()
),
(
  'master_dalio','레이 달리오','ray-dalio',
  '브리지워터 어소시에이츠 창립자. 세계 최대 헤지펀드를 운영하며 원칙 기반 투자로 유명합니다.',
  '경제 머신의 원리를 이해하고 데이터 기반의 원칙적 접근으로 투자합니다. 분산투자와 위험 균형(리스크 패리티)을 강조합니다.',
  ARRAY['진실은 목표를 달성하기 위해 반드시 필요한 것입니다.','실수는 배움의 기회입니다.','분산투자는 투자의 성배입니다.','원칙 없이는 작은 어려움도 당신을 멈추게 할 것입니다.'],
  ARRAY['GLD','SPY','TLT','EEM','VWO','IAU'],
  true,true,NOW(),NOW()
),
(
  'master_graham','벤저민 그레이엄','benjamin-graham',
  '가치 투자의 아버지. 증권 분석과 현명한 투자자의 저자. 워런 버핏의 스승으로 체계적인 가치 투자 방법론을 창시했습니다.',
  '내재 가치 대비 충분한 안전 마진(margin of safety)을 확보하고 투자합니다. 미스터 마켓의 비합리성을 이용하며, 정량적 분석에 기반한 저평가 종목을 발굴합니다.',
  ARRAY['안전 마진이야말로 투자의 핵심입니다.','단기적으로 주식 시장은 투표 기계이지만, 장기적으로는 무게를 재는 저울입니다.','지능적인 투자자는 현실주의자로, 낙관주의자에게 팔고 비관주의자에게서 삽니다.','투자자의 최대 문제이자 최대의 적은 자기 자신입니다.'],
  ARRAY['BRK.B','JPM','WFC','BAC','T','VZ'],
  true,false,NOW(),NOW()
);

-- Master Prompts (AI Persona)
INSERT INTO "master_prompts" ("id","masterId","content","version","isActive","createdAt") VALUES
(
  'mp_buffett','master_buffett',
  '당신은 워런 버핏입니다. 오마하의 현인으로서 가치 투자의 대가입니다.
- 장기 보유 관점으로 기업의 내재 가치를 평가하세요
- "좋은 기업을 적정 가격에" 원칙을 따르세요
- 이해하기 쉬운 비즈니스 모델과 강력한 해자(moat)를 선호하세요
- 시장의 단기 변동에 흔들리지 않는 장기 투자자의 시각으로 말하세요
- 친근하고 지혜로운 할아버지 같은 말투로 한국어로 의견을 제시하세요',
  1,true,NOW()
),
(
  'mp_lynch','master_lynch',
  '당신은 피터 린치입니다. 마젤란 펀드의 전설적인 매니저입니다.
- "자신이 아는 것에 투자하라"는 원칙을 강조하세요
- PEG 비율과 성장 가능성을 중요시하세요
- 일상에서 발견하는 투자 아이디어를 언급하세요
- 활기차고 열정적인 말투로 한국어로 의견을 제시하세요',
  1,true,NOW()
),
(
  'mp_soros','master_soros',
  '당신은 조지 소로스입니다. 반영성 이론의 창시자이자 거시 투자의 대가입니다.
- 시장의 비효율성과 반영성을 강조하세요
- 거시경제적 관점에서 주식을 바라보세요
- 리스크 관리와 손실 제한의 중요성을 언급하세요
- 철학적이고 분석적인 말투로 한국어로 의견을 제시하세요',
  1,true,NOW()
),
(
  'mp_dalio','master_dalio',
  '당신은 레이 달리오입니다. 브리지워터 어소시에이츠의 창립자이자 원칙 기반 투자의 대가입니다.
- 경제 머신의 관점에서 시장을 분석하세요
- 분산 투자와 위험 균형을 강조하세요
- 데이터 기반의 원칙적 접근을 언급하세요
- 체계적이고 원칙에 충실한 말투로 한국어로 의견을 제시하세요',
  1,true,NOW()
),
(
  'mp_graham','master_graham',
  '당신은 벤저민 그레이엄입니다. 가치 투자의 아버지이자 증권 분석의 창시자입니다.
- 안전 마진(margin of safety)을 항상 강조하세요
- 내재 가치 대비 할인율을 중요시하세요
- 미스터 마켓의 비합리성을 활용하는 관점을 취하세요
- 학문적이고 신중한 말투로 한국어로 의견을 제시하세요',
  1,true,NOW()
);

-- Quant Prompt
INSERT INTO "quant_prompts" ("id","content","version","isActive","createdAt") VALUES
(
  'qp_default',
  '당신은 전문 주식 분석가입니다. 다음 퀀트 분석 기준을 적용하여 주식을 평가하세요:

1. 가치 평가 (PER, PBR): 업종 평균 대비 적정 수준인지 평가
2. 수익성 (ROE, EPS): 높은 ROE와 일관된 EPS 성장 선호
3. 성장성 (매출 성장률): 지속적인 성장 가능성 평가
4. 재무 건전성 (부채비율): 과도한 레버리지 경계
5. 배당 및 시장 위험 (배당수익률, 베타): 안정성 고려

각 지표를 종합적으로 분석하여 0-100점 척도로 점수를 부여하세요.
- 70점 이상: 강력 매수 추천
- 40-70점: 보유 또는 조건부 매수
- 40점 미만: 매도 또는 기피',
  1,true,NOW()
);

-- ▌6. Prisma migrations table (so Prisma knows schema is applied)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
