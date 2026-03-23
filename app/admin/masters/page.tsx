import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MasterToggle } from "./MasterToggle";

async function getMasters() {
  return prisma.master.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { analyses: true } },
    },
  });
}

export default async function AdminMastersPage() {
  const masters = await getMasters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">마스터 관리</h1>
        <Link href="/admin/masters/new">
          <Button variant="gold">
            <Plus className="w-4 h-4 mr-2" />
            새 마스터
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {masters.map((master) => (
          <Card key={master.id} className="bg-[#16213e]/80 border-white/10">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f0b429]/20 rounded-full flex items-center justify-center flex-shrink-0 border border-[#f0b429]/30 text-xl font-bold text-[#f0b429]">
                  {master.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{master.name}</h3>
                    <Badge
                      variant={master.isActive ? "default" : "secondary"}
                      className="text-[9px]"
                    >
                      {master.isActive ? "활성" : "비활성"}
                    </Badge>
                    {master.isPremium && (
                      <Badge variant="gold" className="text-[9px]">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {master.bio}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>분석 {master._count.analyses}건</span>
                    <span>생성: {formatDate(master.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <MasterToggle masterId={master.id} isActive={master.isActive} />
                  <Link href={`/admin/masters/${master.id}/edit`}>
                    <Button variant="outline" size="icon" className="h-8 w-8 border-white/20">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
