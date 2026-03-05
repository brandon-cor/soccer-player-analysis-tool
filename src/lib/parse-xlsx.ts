import { PlayerData, COLORS } from "./player-data";

export const RATING_CATEGORIES = [
  "Shooting",
  "Passing",
  "Dribbling",
  "Defending",
  "Physicality",
];

interface MatchRow {
  [key: string]: string | number;
}

const FORWARD_POSITIONS = new Set([
  "CF", "ST", "SS", "LWF", "RWF", "LW", "RW", "AMF", "LAMF", "RAMF",
]);
const MIDFIELD_POSITIONS = new Set([
  "CMF", "LCMF", "RCMF", "DMF", "LDMF", "RDMF", "LMF", "RMF",
]);
const DEFENSE_POSITIONS = new Set([
  "CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB",
]);

function toNumber(value: string | number | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function per90(total: number, totalMinutes: number): number {
  if (totalMinutes <= 0) return 0;
  return (total / totalMinutes) * 90;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeRate(value: number, cap: number): number {
  if (cap <= 0) return 0;
  return clamp((value / cap) * 100, 0, 100);
}

function titleCaseName(fileName: string): string {
  return fileName
    .replace(/^player-stats-/i, "")
    .replace(/\.xlsx$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function stripScore(matchValue: string): string {
  return matchValue.replace(/\s+\d+:\d+\s*$/, "").trim();
}

function detectPrimaryPosition(rows: MatchRow[]): string {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const raw = String(row["Position"] ?? "");
    for (const position of raw.split(",")) {
      const normalized = position.trim().toUpperCase();
      if (!normalized) continue;
      counts[normalized] = (counts[normalized] ?? 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return "Unknown";
  const top = sorted[0][0];

  if (FORWARD_POSITIONS.has(top)) return "Forward";
  if (MIDFIELD_POSITIONS.has(top)) return "Midfielder";
  if (DEFENSE_POSITIONS.has(top)) return "Defender";
  return top;
}

function detectPrimaryTeam(rows: MatchRow[]): string {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const match = stripScore(String(row["Match"] ?? ""));
    const [home, away] = match.split(" - ").map((team) => team.trim());
    if (home) counts[home] = (counts[home] ?? 0) + 1;
    if (away) counts[away] = (counts[away] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "Unknown";
}

function computeRawRatings(rows: MatchRow[]): Record<string, number> {
  const totalMinutes = rows.reduce((acc, row) => acc + toNumber(row["Minutes played"]), 0);
  const matches = rows.length;

  const goals = rows.reduce((acc, row) => acc + toNumber(row["Goals"]), 0);
  const assists = rows.reduce((acc, row) => acc + toNumber(row["Assists"]), 0);
  const xg = rows.reduce((acc, row) => acc + toNumber(row["xG"]), 0);

  const shotsTotal = rows.reduce((acc, row) => acc + toNumber(row["Shots / on target"]), 0);
  const shotsOnTarget = rows.reduce((acc, row) => acc + toNumber(row["_1"]), 0);

  const passesTotal = rows.reduce((acc, row) => acc + toNumber(row["Passes / accurate"]), 0);
  const passesAccurate = rows.reduce((acc, row) => acc + toNumber(row["_2"]), 0);

  const longPassesTotal = rows.reduce((acc, row) => acc + toNumber(row["Long passes / accurate"]), 0);
  const longPassesAccurate = rows.reduce((acc, row) => acc + toNumber(row["_3"]), 0);

  const crossesTotal = rows.reduce((acc, row) => acc + toNumber(row["Crosses / accurate"]), 0);
  const crossesAccurate = rows.reduce((acc, row) => acc + toNumber(row["_4"]), 0);

  const dribblesTotal = rows.reduce((acc, row) => acc + toNumber(row["Dribbles / successful"]), 0);
  const dribblesSuccessful = rows.reduce((acc, row) => acc + toNumber(row["_5"]), 0);

  const duelsTotal = rows.reduce((acc, row) => acc + toNumber(row["Duels / won"]), 0);
  const duelsWon = rows.reduce((acc, row) => acc + toNumber(row["_6"]), 0);

  const aerialDuelsTotal = rows.reduce((acc, row) => acc + toNumber(row["Aerial duels / won"]), 0);
  const aerialDuelsWon = rows.reduce((acc, row) => acc + toNumber(row["_7"]), 0);

  const interceptions = rows.reduce((acc, row) => acc + toNumber(row["Interceptions"]), 0);
  const recoveries = rows.reduce((acc, row) => acc + toNumber(row["Recoveries / opp. half"]), 0);

  // In these sheets, Yellow card is the minute when card happened (0 when none).
  const yellowCards = rows.reduce(
    (acc, row) => acc + (toNumber(row["Yellow card"]) > 0 ? 1 : 0),
    0
  );

  const goalsPer90 = per90(goals, totalMinutes);
  const assistsPer90 = per90(assists, totalMinutes);
  const xgPer90 = per90(xg, totalMinutes);
  const dribblesWonPer90 = per90(dribblesSuccessful, totalMinutes);
  const duelsWonPer90 = per90(duelsWon, totalMinutes);
  const aerialWonPer90 = per90(aerialDuelsWon, totalMinutes);
  const interceptionsPer90 = per90(interceptions, totalMinutes);
  const recoveriesPer90 = per90(recoveries, totalMinutes);
  const yellowPerGame = safeDivide(yellowCards, Math.max(matches, 1));

  const shotAccuracy = safeDivide(shotsOnTarget, shotsTotal) * 100;
  const passAccuracy = safeDivide(passesAccurate, passesTotal) * 100;
  const longPassAccuracy = safeDivide(longPassesAccurate, longPassesTotal) * 100;
  const crossAccuracy = safeDivide(crossesAccurate, crossesTotal) * 100;
  const dribbleSuccess = safeDivide(dribblesSuccessful, dribblesTotal) * 100;
  const duelWinRate = safeDivide(duelsWon, duelsTotal) * 100;

  const shootingScore =
    normalizeRate(goalsPer90, 0.8) * 0.5 +
    shotAccuracy * 0.25 +
    normalizeRate(xgPer90, 0.9) * 0.25;

  const passingScore =
    normalizeRate(assistsPer90, 0.45) * 0.3 +
    passAccuracy * 0.35 +
    crossAccuracy * 0.15 +
    longPassAccuracy * 0.2;

  const dribblingScore =
    normalizeRate(dribblesWonPer90, 4.5) * 0.6 +
    dribbleSuccess * 0.4;

  const defendingScore =
    normalizeRate(interceptionsPer90, 2.8) * 0.3 +
    normalizeRate(recoveriesPer90, 9.5) * 0.3 +
    normalizeRate(aerialWonPer90, 5.5) * 0.2 +
    duelWinRate * 0.2;

  const physicalityScore =
    normalizeRate(duelsWonPer90, 9.5) * 0.4 +
    normalizeRate(aerialWonPer90, 5.5) * 0.3 +
    normalizeRate(yellowPerGame, 0.4) * 0.3;

  function toFinalRating(score: number): number {
    return Math.round(clamp(70 + score / 10, 70, 80));
  }

  return {
    Shooting: toFinalRating(shootingScore),
    Passing: toFinalRating(passingScore),
    Dribbling: toFinalRating(dribblingScore),
    Defending: toFinalRating(defendingScore),
    Physicality: toFinalRating(physicalityScore),
  };
}

export function scalePlayersToRange(players: PlayerData[]): PlayerData[] {
  if (players.length === 0) return players;
  const categories = RATING_CATEGORIES;

  for (const category of categories) {
    const values = players.map((player) => player.stats[category] ?? 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    for (const player of players) {
      if (max === min) {
        player.stats[category] = 75;
      } else {
        const normalized = (player.stats[category] - min) / (max - min);
        player.stats[category] = Math.round(70 + normalized * 10);
      }
    }
  }

  return players;
}

export function parseXlsxRows(
  rows: Record<string, string | number>[],
  fileName: string
): { players: PlayerData[]; categories: string[] } {
  if (rows.length === 0) return { players: [], categories: [] };

  const position = detectPrimaryPosition(rows);
  const team = detectPrimaryTeam(rows);
  const name = titleCaseName(fileName);
  const rawRatings = computeRawRatings(rows);

  const player: PlayerData = {
    name,
    team,
    position,
    color: COLORS[0],
    stats: rawRatings,
  };

  return { players: [player], categories: RATING_CATEGORIES };
}
