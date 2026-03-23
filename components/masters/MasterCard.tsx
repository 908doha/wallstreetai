import Link from "next/link";
import Image from "next/image";
import { Lock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MasterData } from "@/types";
import { truncate } from "@/lib/utils";

interface MasterCardProps {
  master: MasterData;
  isLocked?: boolean;
}

export function MasterCard({ master, isLocked = false }: MasterCardProps) {
  return (
    <Link href={`/masters/${master.id}`}>
      <Card className="bg-[#16213e]/80 border-white/10 hover:border-[#4F8AFF]/40 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#4F8AFF]/20 flex-shrink-0 border border-[#4F8AFF]/30">
              {master.photoUrl ? (
                <Image
                  src={master.photoUrl}
                  alt={master.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#4F8AFF]">
                  {master.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white text-sm">{master.name}</h3>
                {master.isPremium && (
                  <div className="flex items-center gap-1">
                    {isLocked ? (
                      <Lock className="w-3 h-3 text-[#4F8AFF]" />
                    ) : null}
                    <span className="text-[9px] text-[#4F8AFF] font-bold bg-[#4F8AFF]/10 px-1.5 py-0.5 rounded-full border border-[#4F8AFF]/20">
                      PREMIUM
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {truncate(master.bio, 70)}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {master.keyStocks.slice(0, 3).map((stock) => (
                  <span
                    key={stock}
                    className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#4F8AFF] transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
