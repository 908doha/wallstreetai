"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

interface Master {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  cardImageUrl?: string | null;
  cardTagline?: string | null;
  isPremium: boolean;
  philosophy: string;
}

interface MasterCarouselProps {
  masters: Master[];
  onMasterChange?: (master: Master) => void;
}

// 카드 이미지 없을 때 fallback 그라디언트
const CARD_GRADIENTS = [
  { from: "#0c1f4a", accent: "#2563eb" },
  { from: "#0f2d1a", accent: "#16a34a" },
  { from: "#1e0e3d", accent: "#7c3aed" },
  { from: "#2d0f00", accent: "#c2410c" },
  { from: "#0a1e2d", accent: "#0891b2" },
];

export function MasterCarousel({ masters, onMasterChange }: MasterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (masters.length > 0) onMasterChange?.(masters[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masters]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / masters.length;
      const idx = Math.round(el.scrollLeft / cardWidth);
      const newIndex = Math.min(idx, masters.length - 1);
      setActiveIndex(newIndex);
      onMasterChange?.(masters[newIndex]);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [masters, onMasterChange]);

  if (masters.length === 0) return null;

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1 snap-x snap-mandatory"
        style={{ scrollPaddingLeft: "16px" }}
      >
        {masters.map((master, i) => {
          const grad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          const hasImage = !!master.cardImageUrl;

          return (
            <Link
              key={master.id}
              href={`/masters/${master.id}`}
              className="flex-shrink-0 snap-center"
              style={{ width: "calc(80vw)", maxWidth: 320 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ height: 320 }}
              >
                {/* Background */}
                {hasImage ? (
                  <Image
                    src={master.cardImageUrl!}
                    alt={master.name}
                    fill
                    className="object-cover"
                    sizes="80vw"
                  />
                ) : (
                  /* Gradient fallback with portrait */
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${grad.accent}55 0%, ${grad.from} 70%)`,
                    }}
                  >
                    {master.photoUrl ? (
                      <div className="relative w-40 h-40 rounded-full overflow-hidden opacity-50">
                        <Image
                          src={master.photoUrl}
                          alt={master.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span
                        className="text-8xl font-black opacity-10 select-none"
                        style={{ color: grad.accent }}
                      >
                        {master.name.charAt(0)}
                      </span>
                    )}
                  </div>
                )}

                {/* Dark gradient overlay at bottom */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: hasImage
                      ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                  }}
                />

                {/* Premium badge */}
                {master.isPremium && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Lock className="w-2.5 h-2.5 text-white/70" />
                    <span className="text-[10px] text-white/70 font-semibold tracking-widest">PRO</span>
                  </div>
                )}

                {/* Avatar (small, top-left, only when there's a card image) */}
                {hasImage && master.photoUrl && (
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                    <Image
                      src={master.photoUrl}
                      alt={master.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Text overlay — bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
                  <h3 className="text-[22px] font-black text-white leading-tight tracking-tight">
                    {master.name}
                  </h3>
                  <p className="text-[13px] text-white/70 mt-1 leading-snug line-clamp-2">
                    {master.cardTagline || master.bio}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dot indicators */}
      {masters.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {masters.map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 20 : 5,
                height: 5,
                background: i === activeIndex ? "#4F8AFF" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
