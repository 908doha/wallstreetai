"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title?: string;
  showLogo?: boolean;
  rightElement?: React.ReactNode;
}

const navItems = [
  { href: "/", label: "홈" },
  { href: "/analysis", label: "분석하기" },
  { href: "/masters", label: "거장들" },
  { href: "/mypage", label: "마이페이지" },
];

export function TopNav({ title, showLogo = true, rightElement }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();

  // close on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openMenu() {
    setClosing(false);
    setOpen(true);
  }

  function closeMenu() {
    if (!open) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  }

  return (
    <>
      {/* ── Header bar ───────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-dark border-b border-white/[0.07]">
        <div className="mx-auto max-w-[390px] flex items-center justify-between h-14 px-4">
          {/* Left: Logo or title */}
          {showLogo ? (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 glass-gold rounded-xl">
                <TrendingUp className="w-4 h-4 text-[#4F8AFF]" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-white">
                Wall Street <span className="text-[#4F8AFF]">AI</span>
              </span>
            </Link>
          ) : (
            <h1 className="font-semibold text-[15px] text-white">{title}</h1>
          )}

          {/* Right: extra element + search + hamburger */}
          <div className="flex items-center gap-1.5">
            {rightElement && rightElement}
            <button
              aria-label="검색"
              className="w-9 h-9 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-300" />
            </button>
            <button
              aria-label="메뉴 열기"
              onClick={openMenu}
              className="w-9 h-9 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
            >
              {/* Custom hamburger lines */}
              <span className="flex flex-col gap-[5px]">
                <span className="block w-[18px] h-[1.5px] bg-gray-200 rounded-full" />
                <span className="block w-[18px] h-[1.5px] bg-gray-200 rounded-full" />
                <span className="block w-[12px]  h-[1.5px] bg-gray-200 rounded-full self-end" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay + Slide menu ─────────────────────── */}
      {open && (
        <>
          {/* Dark overlay */}
          <div
            className={cn(
              "fixed inset-0 z-50 bg-black/65",
              closing ? "animate-fade-overlay-out" : "animate-fade-overlay-in"
            )}
            style={closing ? { animation: "fade-overlay-in 0.25s ease reverse forwards" } : undefined}
            onClick={closeMenu}
          />

          {/* Slide panel */}
          <div
            className={cn(
              "fixed top-0 right-0 z-50 h-full w-[76%] max-w-[300px] glass-dark border-l border-white/[0.08] flex flex-col",
              closing ? "animate-slide-out-right" : "animate-slide-in-right"
            )}
          >
            {/* Close button */}
            <div className="flex justify-end px-5 pt-5 pb-2">
              <button
                onClick={closeMenu}
                aria-label="메뉴 닫기"
                className="w-9 h-9 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 flex flex-col px-7 pt-6 gap-0.5">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "py-4 text-[22px] font-semibold tracking-tight transition-colors border-b border-white/[0.06] last:border-none",
                      isActive
                        ? "text-[#4F8AFF]"
                        : "text-white/90 hover:text-[#4F8AFF]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA at bottom */}
            <div className="px-7 pb-10 pt-4 space-y-3">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="block w-full h-12 rounded-2xl bg-[#4F8AFF] text-[#0a0a1a] font-bold text-[15px] flex items-center justify-center transition-opacity hover:opacity-90 active:opacity-80"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                onClick={closeMenu}
                className="block w-full h-11 rounded-2xl glass text-white/80 font-medium text-[14px] flex items-center justify-center transition-colors hover:text-white"
              >
                회원가입
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
