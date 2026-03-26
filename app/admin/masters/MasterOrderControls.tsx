"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Master {
  id: string;
  order: number;
}

interface Props {
  master: Master;
  masters: Master[];
}

export function MasterOrderControls({ master, masters }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 현재 렌더된 순서(인덱스)를 기준으로 사용 — order 값 중복 문제 방지
  const idx = masters.findIndex((m) => m.id === master.id);

  const move = async (direction: "up" | "down") => {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= masters.length) return;

    // 새 순서: 현재 배열을 그대로 두고 두 항목만 위치 교환 후 전체 재색인
    const newOrder = [...masters];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    setLoading(true);
    await fetch("/api/admin/masters/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: newOrder.map((m, i) => ({ id: m.id, order: i })),
      }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 border-white/20"
        disabled={loading || idx === 0}
        onClick={() => move("up")}
      >
        <ChevronUp className="w-3 h-3" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 border-white/20"
        disabled={loading || idx === masters.length - 1}
        onClick={() => move("down")}
      >
        <ChevronDown className="w-3 h-3" />
      </Button>
    </div>
  );
}
