"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/analysis", icon: BarChart2, label: "분석" },
  { href: "/masters", icon: Users, label: "마스터" },
  { href: "/mypage", icon: User, label: "마이페이지" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0f0f23]/95 backdrop-blur-md">
      <div className="mx-auto max-w-[390px]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  isActive
                    ? "text-[#4F8AFF]"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
