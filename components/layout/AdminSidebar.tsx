"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCog,
  Shield,
  CreditCard,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/prompts", icon: FileText, label: "프롬프트 관리" },
  { href: "/admin/masters", icon: Users, label: "마스터 관리" },
  { href: "/admin/users", icon: UserCog, label: "사용자 관리" },
  { href: "/admin/access-control", icon: Shield, label: "접근 제어" },
  { href: "/admin/payments", icon: CreditCard, label: "결제 관리" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[#0f0f23] flex flex-col">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 bg-[#f0b429] rounded-lg">
          <TrendingUp className="w-5 h-5 text-[#1a1a2e]" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-sm text-white">Wall Street AI</p>
          <p className="text-xs text-gray-400">관리자 패널</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#f0b429]/20 text-[#f0b429]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-2"
        >
          <TrendingUp className="w-5 h-5" />
          사용자 페이지
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-400/10"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          <LogOut className="w-5 h-5 mr-3" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
