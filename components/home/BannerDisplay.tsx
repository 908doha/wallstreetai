"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
}

export function BannerDisplay() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch(() => {});
  }, []);

  // Rotate banners every 5 seconds
  useEffect(() => {
    const visible = banners.filter((b) => !dismissed.has(b.id));
    if (visible.length <= 1) return;
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % visible.length);
        setAnimating(false);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners, dismissed]);

  const visible = banners.filter((b) => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  const banner = visible[currentIndex % visible.length];

  return (
    <div
      className="glass-card rounded-2xl p-4 flex items-center gap-3 transition-all duration-200"
      style={{ opacity: animating ? 0 : 1 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-white leading-snug">{banner.title}</p>
        {banner.subtitle && (
          <p className="text-[11px] text-white/50 mt-0.5">{banner.subtitle}</p>
        )}
      </div>

      {banner.ctaText && banner.ctaLink && (
        <Link
          href={banner.ctaLink}
          className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F8AFF] hover:text-white transition-colors"
        >
          {banner.ctaText}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}

      <button
        onClick={() => {
          setDismissed((prev) => new Set([...prev, banner.id]));
          setCurrentIndex(0);
        }}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5 text-white/40" />
      </button>
    </div>
  );
}
