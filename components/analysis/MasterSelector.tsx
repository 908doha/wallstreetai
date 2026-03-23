"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MasterData } from "@/types";

interface MasterSelectorProps {
  onSelect: (master: MasterData) => void;
  selectedMasterId?: string;
  allowedAccess?: "ALL" | "BASIC";
}

export function MasterSelector({
  onSelect,
  selectedMasterId,
  allowedAccess = "BASIC",
}: MasterSelectorProps) {
  const [masters, setMasters] = useState<MasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/masters")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMasters(data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-[#16213e] rounded-xl animate-pulse border border-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {masters.map((master) => {
        const isLocked = master.isPremium && allowedAccess !== "ALL";
        const isSelected = selectedMasterId === master.id;

        return (
          <button
            key={master.id}
            onClick={() => !isLocked && onSelect(master)}
            disabled={isLocked}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
              isSelected
                ? "border-[#4F8AFF] bg-[#4F8AFF]/10"
                : "border-white/10 bg-[#16213e]/80 hover:border-white/30",
              isLocked && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLocked && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3.5 h-3.5 text-[#4F8AFF]" />
              </div>
            )}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#4F8AFF]/20 flex items-center justify-center">
              {master.photoUrl ? (
                <Image
                  src={master.photoUrl}
                  alt={master.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl">
                  {master.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white leading-tight">
                {master.name}
              </p>
              {master.isPremium && (
                <span className="text-[9px] text-[#4F8AFF] font-medium">
                  PREMIUM
                </span>
              )}
            </div>
            {isSelected && (
              <div className="absolute inset-0 rounded-xl border-2 border-[#4F8AFF] pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
