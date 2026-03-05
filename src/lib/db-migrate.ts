import { getPool } from "./db";

export async function migrateUploadsTable() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      player_data JSONB NOT NULL,
      categories JSONB NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON uploads(uploaded_at DESC);
  `);
}
