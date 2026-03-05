import { NextResponse } from "next/server";
import demoPlayers from "@/lib/demo-players.json";

export async function GET() {
  return NextResponse.json({ players: demoPlayers });
}
