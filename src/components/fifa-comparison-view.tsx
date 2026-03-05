"use client";

import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./image-with-fallback";
import { PlayerData, overallRating, getRatingColor } from "@/lib/player-data";

interface FIFAComparisonViewProps {
  playerA: PlayerData;
  playerB: PlayerData;
  categories: string[];
  imageUrlA?: string;
  imageUrlB?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = 0;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      setDisplay(Math.round(easeOutCubic(progress) * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display}</>;
}

function StatRow({
  label,
  valueA,
  valueB,
  isNumeric = true,
  delay = 0,
}: {
  label: string;
  valueA: string | number;
  valueB: string | number;
  isNumeric?: boolean;
  delay?: number;
}) {
  const numA = typeof valueA === "number" ? valueA : 0;
  const numB = typeof valueB === "number" ? valueB : 0;
  const aIsHigher = numA > numB;
  const bIsHigher = numB > numA;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isNumeric)
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="min-w-0 text-right">
          <span
            className="text-sm md:text-base font-semibold text-gray-200 uppercase tracking-wide break-words"
            title={String(valueA)}
          >
            {valueA}
          </span>
        </div>
        <div className="px-2 min-w-[110px] text-center">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="min-w-0 text-left">
          <span
            className="text-sm md:text-base font-semibold text-gray-200 uppercase tracking-wide break-words"
            title={String(valueB)}
          >
            {valueB}
          </span>
        </div>
      </div>
    );

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 text-right">
        <span
          className="text-xl font-black"
          style={{
            color: isNumeric
              ? aIsHigher
                ? "#E8A838"
                : "#6B7280"
              : "#e5e7eb",
          }}
        >
          {isNumeric ? <AnimatedNumber value={numA} duration={1000 + delay} /> : valueA}
        </span>
      </div>

      <div className="flex-1 flex items-center">
        <div className="flex-1 flex justify-end h-7">
          <div
            className="h-full rounded-l-full"
            style={{
              width: isVisible ? `${numA}%` : "0%",
              backgroundColor: aIsHigher
                ? "#E8A838"
                : "rgba(255, 255, 255, 0.1)",
              transition: `width ${0.8 + delay / 1000}s cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        </div>
        <div className="px-4 min-w-[140px] text-center">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex-1 flex justify-start h-7">
          <div
            className="h-full rounded-r-full"
            style={{
              width: isVisible ? `${numB}%` : "0%",
              backgroundColor: bIsHigher
                ? "#E8A838"
                : "rgba(255, 255, 255, 0.1)",
              transition: `width ${0.8 + delay / 1000}s cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        </div>
      </div>

      <div className="w-12 text-left">
        <span
          className="text-xl font-black"
          style={{
            color: isNumeric
              ? bIsHigher
                ? "#E8A838"
                : "#6B7280"
              : "#e5e7eb",
          }}
        >
          {isNumeric ? <AnimatedNumber value={numB} duration={1000 + delay} /> : valueB}
        </span>
      </div>
    </div>
  );
}

export function FIFAComparisonView({
  playerA,
  playerB,
  categories,
  imageUrlA,
  imageUrlB,
}: FIFAComparisonViewProps) {
  const overallA = overallRating(playerA.stats);
  const overallB = overallRating(playerB.stats);
  const ratingColorA = getRatingColor(overallA);
  const ratingColorB = getRatingColor(overallB);

  const infoRows: { label: string; a: string | number; b: string | number; numeric: boolean }[] = [
    { label: "Age", a: playerA.age ?? "–", b: playerB.age ?? "–", numeric: false },
    { label: "Height", a: playerA.height ?? "–", b: playerB.height ?? "–", numeric: false },
    { label: "Position", a: playerA.position ?? "–", b: playerB.position ?? "–", numeric: false },
    { label: "Foot", a: playerA.foot ?? "–", b: playerB.foot ?? "–", numeric: false },
  ];

  return (
    <div className="px-4 py-3 h-[calc(100vh-56px)] overflow-hidden">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 h-full flex flex-col overflow-visible">
          {/* Header: Players */}
          <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-white/10 overflow-visible">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Player A */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden border-[3px] shadow-xl"
                    style={{ borderColor: ratingColorA }}
                  >
                    <ImageWithFallback
                      src={
                        imageUrlA ||
                        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400"
                      }
                      alt={playerA.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: ratingColorA }}
                  >
                    <span className="text-lg font-black">{overallA}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {playerA.name}
                  </h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest break-words">
                    {playerA.team || "Player A"}
                  </p>
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center gap-3 text-gray-500 px-4">
                <div className="w-10 h-px bg-white/20" />
                <span className="text-sm uppercase tracking-wider font-black">VS</span>
                <div className="w-10 h-px bg-white/20" />
              </div>

              {/* Player B */}
              <div className="flex items-center gap-4 justify-end">
                <div className="min-w-0 text-right">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {playerB.name}
                  </h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest break-words">
                    {playerB.team || "Player B"}
                  </p>
                </div>
                <div className="relative flex-shrink-0">
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden border-[3px] shadow-xl"
                    style={{ borderColor: ratingColorB }}
                  >
                    <ImageWithFallback
                      src={
                        imageUrlB ||
                        "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400"
                      }
                      alt={playerB.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: ratingColorB }}
                  >
                    <span className="text-lg font-black">{overallB}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Attributes — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6">
            <div className="flex flex-col justify-evenly py-4" style={{ minHeight: "100%" }}>
              {infoRows.map((row) => (
                <StatRow
                  key={row.label}
                  label={row.label}
                  valueA={row.a}
                  valueB={row.b}
                  isNumeric={row.numeric}
                />
              ))}
              <div className="border-t border-white/10" />
              {categories.map((category, i) => (
                <StatRow
                  key={category}
                  label={category}
                  valueA={playerA.stats[category] || 0}
                  valueB={playerB.stats[category] || 0}
                  delay={i * 100}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
