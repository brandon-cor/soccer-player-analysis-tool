export interface PlayerData {
  name: string;
  color: string;
  stats: Record<string, number>;
  team?: string;
  age?: number;
  height?: string;
  position?: string;
  foot?: string;
}

export const COLORS = ["#E8A838", "#3A7D44", "#E05C5C", "#5B8DD9", "#9B59B6"];

export const DEFAULT_CATEGORIES = [
  "Shooting",
  "Passing",
  "Dribbling",
  "Defending",
  "Physicality",
];

export const DEFAULT_PLAYERS: PlayerData[] = [
  {
    name: "Player A",
    color: COLORS[0],
    stats: {
      Shooting: 76,
      Passing: 75,
      Dribbling: 77,
      Defending: 72,
      Physicality: 74,
    },
    age: 26,
    height: "5'11\"",
    position: "ST",
    foot: "Right",
  },
  {
    name: "Player B",
    color: COLORS[1],
    stats: {
      Shooting: 74,
      Passing: 78,
      Dribbling: 73,
      Defending: 76,
      Physicality: 75,
    },
    age: 28,
    height: "6'2\"",
    position: "CM",
    foot: "Left",
  },
];

export function overallRating(stats: Record<string, number>) {
  const vals = Object.values(stats);
  return vals.length
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : 0;
}

export function getRatingColor(rating: number): string {
  if (rating >= 85) return "#E8A838";
  if (rating >= 75) return "#D4A03A";
  if (rating >= 65) return "#FACC15";
  if (rating >= 50) return "#FB923C";
  return "#EF4444";
}
