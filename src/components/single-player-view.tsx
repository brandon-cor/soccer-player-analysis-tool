"use client";

import { ImageWithFallback } from "./image-with-fallback";
import { PlayerData, getRatingColor, overallRating } from "@/lib/player-data";
import { PlayerRadarChart } from "./radar-chart";
import { SpeedometerGauge } from "./speedometer-gauge";

interface SinglePlayerViewProps {
  player: PlayerData;
  categories: string[];
  imageUrl?: string;
}

export function SinglePlayerView({
  player,
  categories,
  imageUrl,
}: SinglePlayerViewProps) {
  const overall = overallRating(player.stats);
  const ratingColor = getRatingColor(overall);
  const detailBadges = [
    player.position,
    player.age ? `Age ${player.age}` : null,
    player.height,
    player.foot,
  ].filter(Boolean);

  return (
    <div className="py-3 px-4 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-3">
        {/* Player Profile */}
        <div className="flex-shrink-0 flex items-center gap-5 py-3 px-2">
          <div className="relative flex-shrink-0">
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden border-[3px] shadow-xl"
              style={{ borderColor: ratingColor }}
            >
              <ImageWithFallback
                src={
                  imageUrl ||
                  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500"
                }
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white shadow-xl"
              style={{ backgroundColor: ratingColor }}
            >
              <span className="text-xl font-black">{overall}</span>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {player.name}
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              {player.team || "Player Analysis"}
            </p>
            {detailBadges.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {detailBadges.map((detail) => (
                  <span
                    key={detail}
                    className="px-2 py-1 text-[10px] text-white/90 border border-white/20 rounded-full uppercase tracking-wider"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Two panels side by side */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left — Performance Radar */}
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/10 flex flex-col min-h-0">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-2">
              Performance Radar
            </h2>
            <div className="flex items-center justify-center flex-1 min-h-0">
              <PlayerRadarChart players={[player]} categories={categories} compact />
            </div>
          </div>

          {/* Right — Stats Overview */}
          <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/10 flex flex-col min-h-0">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-2">
              Stats Overview
            </h2>
            <div className="grid grid-cols-2 gap-2 flex-1 content-center items-center">
              {Object.entries(player.stats).map(([stat, value]) => (
                <SpeedometerGauge key={stat} value={value} label={stat} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
