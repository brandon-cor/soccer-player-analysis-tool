import { NextResponse } from "next/server";
import { migrateUploadsTable } from "@/lib/db-migrate";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await migrateUploadsTable();
    return NextResponse.json({ message: "Uploads table migrated successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
