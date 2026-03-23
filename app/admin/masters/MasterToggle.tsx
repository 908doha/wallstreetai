"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function MasterToggle({
  masterId,
  isActive,
}: {
  masterId: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/masters/${masterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      const data = await res.json();
      if (data.success) {
        setActive(!active);
        router.refresh();
        toast({ title: active ? "비활성화되었습니다" : "활성화되었습니다" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`h-8 w-8 border-white/20 ${
        active ? "text-green-400 hover:text-red-400" : "text-gray-500 hover:text-green-400"
      }`}
      onClick={toggle}
      disabled={loading}
    >
      {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </Button>
  );
}
