import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { MasterForm } from "../../MasterForm";

async function getMaster(id: string) {
  return prisma.master.findUnique({ where: { id } });
}

export default async function EditMasterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const master = await getMaster(id);
  if (!master) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">{master.name} 수정</h1>
      <Card className="bg-[#16213e]/80 border-white/10">
        <CardContent className="pt-6">
          <MasterForm master={master} />
        </CardContent>
      </Card>
    </div>
  );
}
