"use client";

import { useEffect, useState } from "react";
import { SinglePlayerView } from "@/components/single-player-view";
import {
  PlayerData,
  DEFAULT_PLAYERS,
  DEFAULT_CATEGORIES,
} from "@/lib/player-data";

interface PlayerInfoResponse {
  fullName: string | null;
  age: number | null;
  height: string | null;
  foot: string | null;
}

async function enrichPlayerWithMetadata(player: PlayerData): Promise<PlayerData> {
  const params = new URLSearchParams({
    name: player.name,
    team: player.team ?? "",
  });

  try {
    const response = await fetch(`/api/player-info?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return player;

    const metadata = (await response.json()) as PlayerInfoResponse;
    return {
      ...player,
      name: metadata.fullName || player.name,
      age: metadata.age ?? player.age,
      height: metadata.height ?? player.height,
      foot: metadata.foot ?? player.foot,
    };
  } catch {
    return player;
  }
}

export default function AnalysisPage() {
  const [player, setPlayer] = useState<PlayerData>(DEFAULT_PLAYERS[0]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayer() {
      try {
        const raw = sessionStorage.getItem("moneyball_data");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.mode !== "analysis") return;

        const parsedPlayer = data.players?.[0] as PlayerData | undefined;
        if (!parsedPlayer) return;

        if (isMounted) setPlayer(parsedPlayer);
        if (data.categories?.length && isMounted) setCategories(data.categories);

        const enrichedPlayer = await enrichPlayerWithMetadata(parsedPlayer);
        if (isMounted) setPlayer(enrichedPlayer);
      } catch {
        // fall back to defaults
      }
    }

    void loadPlayer();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SinglePlayerView
      player={player}
      categories={categories}
    />
  );
}
