import "server-only";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function initTables() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS text_overrides (
      id         SERIAL PRIMARY KEY,
      entity     TEXT NOT NULL,
      entity_id  TEXT NOT NULL,
      field      TEXT NOT NULL,
      value      TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(entity, entity_id, field)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `;
}

export async function getOverrides(
  entity: string,
  entityId: string
): Promise<Record<string, string>> {
  if (process.env.GITHUB_ACTIONS === "true") return {};

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT field, value FROM text_overrides
      WHERE entity = ${entity} AND entity_id = ${entityId}
    `;
    const overrides: Record<string, string> = {};
    for (const row of rows) {
      overrides[row.field] = row.value;
    }
    return overrides;
  } catch {
    return {};
  }
}

export async function upsertOverride(
  entity: string,
  entityId: string,
  field: string,
  value: string
) {
  const sql = getDb();
  await sql`
    INSERT INTO text_overrides (entity, entity_id, field, value, updated_at)
    VALUES (${entity}, ${entityId}, ${field}, ${value}, NOW())
    ON CONFLICT (entity, entity_id, field)
    DO UPDATE SET value = ${value}, updated_at = NOW()
  `;
}

export async function getAdminByEmail(email: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${email}
  `;
  return rows[0] || null;
}

export async function createAdmin(email: string, passwordHash: string) {
  const sql = getDb();
  await sql`
    INSERT INTO admin_users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
  `;
}
