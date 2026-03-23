"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { truncate } from "@/lib/utils";

interface Master {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  isPremium: boolean;
  philosophy: string;
}

interface MasterCarouselProps {
  masters: Master[];
}

const CARD_GRADIENTS = [
  ["#1a3566", "#2563eb"],
  ["#1a4a2e", "#16a34a"],
  ["#3b1a6e", "#7c3aed"],
  ["#4a1a00", "#c2410c"],
  ["#1a3a4a", "#0891b2"],
];

export function MasterCarousel({ masters }: MasterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const cardWidth = el.scrollWidth / masters.length;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, masters.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [masters.length]);

  if (masters.length === 0) return null;

  return (
    <div>
      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-1 snap-x snap-mandatory"
        style={{ scrollPaddingLeft: "16px" }}
      >
        {masters.map((master, i) => {
          const [from, to] = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          return (
            <Link
              key={master.id}
              href={`/masters/${master.id}`}
              className="flex-shrink-0 snap-center"
              style={{ width: "calc(78vw)", maxWidth: 300 }}
            >
              <div
                className="rounded-3xl p-6 flex flex-col items-center text-center h-[260px] justify-between relative overflow-hidden"
                style={{
                  background: `radial-gradient(ellipse at 50% 10%, ${to}55 0%, ${from} 70%)`,
                  boxShadow: `0 8px 32px ${to}33`,
                  border: `1px solid ${to}40`,
                }}
              >
                {/* Background glow */}
                <div
                  className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `${to}30` }}
                />

                {/* Premium badge */}
                {master.isPremium && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5 text-white/70" />
                    <span className="text-[9px] text-white/70 font-semibold">PRO</span>
                  </div>
                )}

                {/* Avatar */}
                <div
                  className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0 mt-2"
                  style={{
                    background: `radial-gradient(circle, ${to}60 0%, ${to}20 100%)`,
                    border: `2px solid ${to}80`,
                    boxShadow: `0 0 24px ${to}50`,
                  }}
                >
                  {master.photoUrl ? (
                    <Image
                      src={master.photoUrl}
                      alt={master.name}
                      width={72}
                      height={72}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {master.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2">
                  <h3 className="text-[17px] font-bold text-white">{master.name}</h3>
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    {truncate(master.bio, 60)}
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
                width: i === activeIndex ? 16 : 5,
                height: 5,
                background: i === activeIndex ? "#4F8AFF" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
