"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FIFAComparisonView } from "@/components/fifa-comparison-view";
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

export default function ComparisonPage() {
  const [playerA, setPlayerA] = useState<PlayerData>(DEFAULT_PLAYERS[0]);
  const [playerB, setPlayerB] = useState<PlayerData>(DEFAULT_PLAYERS[1]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        const raw = sessionStorage.getItem("moneyball_data");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.mode !== "comparison") return;

        const parsedPlayerA = data.playerA as PlayerData | undefined;
        const parsedPlayerB = data.playerB as PlayerData | undefined;
        if (!parsedPlayerA || !parsedPlayerB) return;

        if (isMounted) {
          setPlayerA(parsedPlayerA);
          setPlayerB(parsedPlayerB);
        }
        if (data.categories?.length && isMounted) setCategories(data.categories);

        const [enrichedA, enrichedB] = await Promise.all([
          enrichPlayerWithMetadata(parsedPlayerA),
          enrichPlayerWithMetadata(parsedPlayerB),
        ]);

        if (isMounted) {
          setPlayerA(enrichedA);
          setPlayerB(enrichedB);
        }
      } catch {
        // fall back to defaults
      }
    }

    void loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="px-4 pt-4">
      <div className="max-w-5xl mx-auto mb-3">
        <Link
          href="/upload"
          className="hover-lift inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          style={{ fontFamily: '"Instrument Sans", sans-serif' }}
        >
          <ArrowLeft size={16} />
          Back to upload
        </Link>
      </div>
      <FIFAComparisonView
        playerA={playerA}
        playerB={playerB}
        categories={categories}
      />
    </div>
  );
}
