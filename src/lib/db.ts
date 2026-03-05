import { Pool } from "pg";

const globalPool = globalThis as unknown as { __pgPool?: Pool };

export function getPool(): Pool {
  if (!globalPool.__pgPool) {
    globalPool.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalPool.__pgPool;
}
