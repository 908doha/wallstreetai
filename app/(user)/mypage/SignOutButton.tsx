"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="w-4 h-4 mr-2" />
      로그아웃
    </Button>
  );
}
