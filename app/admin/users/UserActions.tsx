"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { Role } from "@/types";

interface UserActionsProps {
  userId: string;
  currentRole: Role;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [role, setRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleChange = async (newRole: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setRole(newRole as Role);
        router.refresh();
        toast({ title: "역할이 변경되었습니다" });
      } else {
        toast({ title: "변경 실패", variant: "destructive" });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={isUpdating}>
        <SelectTrigger className="h-8 w-28 text-xs bg-[#0f0f23] border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#16213e] border-white/10">
          <SelectItem value="free" className="text-xs">무료</SelectItem>
          <SelectItem value="pro" className="text-xs">프로</SelectItem>
          <SelectItem value="premium" className="text-xs">프리미엄</SelectItem>
          <SelectItem value="admin" className="text-xs">관리자</SelectItem>
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-[#f0b429]" />}
    </div>
  );
}
