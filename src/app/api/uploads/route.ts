import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, file_name, uploaded_at, player_data, categories
     FROM uploads
     WHERE user_id = $1
     ORDER BY uploaded_at DESC
     LIMIT 50`,
    [session.user.id]
  );

  return NextResponse.json({ uploads: result.rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, playerData, categories } = body;

  if (!fileName || !playerData || !categories) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO uploads (user_id, file_name, player_data, categories)
     VALUES ($1, $2, $3, $4)
     RETURNING id, file_name, uploaded_at`,
    [session.user.id, fileName, JSON.stringify(playerData), JSON.stringify(categories)]
  );

  return NextResponse.json({ upload: result.rows[0] }, { status: 201 });
}
