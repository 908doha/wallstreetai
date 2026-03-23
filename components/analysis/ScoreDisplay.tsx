"use client";

import { getScoreColor } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  size?: number;
}

export function ScoreDisplay({ score, size = 100 }: ScoreDisplayProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "매우 강함";
    if (score >= 60) return "강함";
    if (score >= 40) return "보통";
    if (score >= 20) return "약함";
    return "매우 약함";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={8}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{
              fontSize: size * 0.22,
              color,
            }}
          >
            {score}
          </span>
          <span
            className="text-gray-400 leading-none mt-1"
            style={{ fontSize: size * 0.1 }}
          >
            / 100
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400">{getScoreLabel(score)}</span>
    </div>
  );
}
