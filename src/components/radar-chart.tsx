"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PlayerData, COLORS } from "@/lib/player-data";

interface RadarChartProps {
  players: PlayerData[];
  categories: string[];
  compact?: boolean;
}

export function PlayerRadarChart({ players, categories, compact }: RadarChartProps) {
  if (players.length === 0 || categories.length === 0) return null;

  const data = categories.map((cat) => {
    const entry: Record<string, string | number> = { subject: cat };
    players.forEach((p) => {
      entry[p.name] = p.stats[cat] ?? 0;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={compact ? "100%" : 360}>
      <RadarChart
        data={data}
        margin={compact ? { top: 10, right: 30, bottom: 10, left: 30 } : { top: 20, right: 40, bottom: 20, left: 40 }}
      >
        <PolarGrid stroke="#ffffff20" strokeDasharray="0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#e5e7eb", fontSize: compact ? 10 : 12, fontWeight: 600 }}
        />
        {players.map((player, i) => (
          <Radar
            key={player.name}
            name={player.name}
            dataKey={player.name}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.2}
            strokeWidth={3}
          />
        ))}
        <Legend
          wrapperStyle={{ paddingTop: compact ? 4 : 12, fontSize: compact ? 11 : 13 }}
          formatter={(value) => (
            <span style={{ color: "#ffffff", fontWeight: 700 }}>{value}</span>
          )}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
