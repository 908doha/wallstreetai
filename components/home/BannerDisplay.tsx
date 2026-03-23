"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  iconUrl: string | null;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "__default__",
    title: "투자 거장의 눈으로 주식을 분석하세요",
    subtitle: "워런 버핏, 피터 린치의 철학으로 AI가 종목을 분석합니다",
    ctaText: "지금 분석하기",
    ctaLink: "/analysis",
    iconUrl: null,
  },
];

export function BannerDisplay() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
        else setBanners(DEFAULT_BANNERS);
      })
      .catch(() => setBanners(DEFAULT_BANNERS));
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

  const inner = (
    <div
      className="glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 relative"
      style={{ opacity: animating ? 0 : 1 }}
    >
      {/* Text content */}
      <div className="flex-1 min-w-0">
        {banner.subtitle && (
          <p className="text-[11px] text-white/45 mb-1">{banner.subtitle}</p>
        )}
        <p className="text-[22px] font-bold text-white leading-snug">{banner.title}</p>
        {banner.ctaText && !banner.ctaLink && (
          <p className="text-[12px] text-[#4F8AFF] mt-1 font-semibold">{banner.ctaText}</p>
        )}
      </div>

      {/* Icon */}
      {banner.iconUrl && (
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden glass flex items-center justify-center">
          <Image
            src={banner.iconUrl}
            alt={banner.title}
            width={56}
            height={56}
            className="object-contain w-full h-full"
            unoptimized
          />
        </div>
      )}

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed((prev) => new Set([...prev, banner.id]));
          setCurrentIndex(0);
        }}
        className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full glass hover:bg-white/10 transition-colors"
      >
        <X className="w-3 h-3 text-white/40" />
      </button>
    </div>
  );

  if (banner.ctaLink) {
    return (
      <Link href={banner.ctaLink} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}
