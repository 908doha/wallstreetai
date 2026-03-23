import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MasterCard } from "@/components/masters/MasterCard";
import { getMasterAccessLevel } from "@/lib/permissions";

async function getMasters() {
  return prisma.master.findMany({
    where: { isActive: true },
    orderBy: [{ isPremium: "asc" }, { createdAt: "asc" }],
  });
}

export default async function MastersPage() {
  const session = await auth();
  const masters = await getMasters();

  let accessLevel: "ALL" | "BASIC" = "BASIC";
  if (session?.user?.id) {
    accessLevel = await getMasterAccessLevel(session.user.id);
  }

  const basicMasters = masters.filter((m) => !m.isPremium);
  const premiumMasters = masters.filter((m) => m.isPremium);

  return (
    <div>
      <Header title="투자 마스터" showLogo={false} />

      <div className="px-4 pt-4 space-y-4">
        <p className="text-sm text-gray-400">
          월스트리트 전설들의 투자 철학으로 종목을 분석하세요
        </p>

        {basicMasters.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              기본 마스터
            </h2>
            <div className="space-y-3">
              {basicMasters.map((master) => (
                <MasterCard
                  key={master.id}
                  master={master}
                  isLocked={false}
                />
              ))}
            </div>
          </section>
        )}

        {premiumMasters.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                프리미엄 마스터
              </h2>
              <span className="text-[9px] bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30 px-1.5 py-0.5 rounded-full font-bold">
                PRO+
              </span>
            </div>
            <div className="space-y-3">
              {premiumMasters.map((master) => (
                <MasterCard
                  key={master.id}
                  master={master}
                  isLocked={accessLevel !== "ALL"}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
