"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  rightElement?: React.ReactNode;
}

export function Header({ title, showLogo = true, rightElement }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0f23]/95 backdrop-blur-md">
      <div className="mx-auto max-w-[390px] flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-[#f0b429] rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#1a1a2e]" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-white">
              Wall Street <span className="text-[#f0b429]">AI</span>
            </span>
          </Link>
        ) : (
          <h1 className="font-semibold text-base text-white">{title}</h1>
        )}
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
