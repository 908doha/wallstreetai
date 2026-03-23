import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/layout/TopNav";
import { MasterDetail } from "@/components/masters/MasterDetail";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";

async function getMaster(id: string) {
  return prisma.master.findUnique({ where: { id, isActive: true } });
}

export default async function MasterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const master = await getMaster(params.id);
  if (!master) notFound();

  return (
    <div>
      <TopNav title={master.name} showLogo={false} />

      <div className="px-4 pt-4 space-y-4">
        <MasterDetail master={master} />

        <Link href={`/analysis?masterId=${master.id}`}>
          <Button variant="gold" className="w-full h-11">
            <BarChart2 className="w-4 h-4 mr-2" />
            {master.name}으로 분석하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
