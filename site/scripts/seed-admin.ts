import { hash } from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = process.argv[2];
const ADMIN_PASSWORD = process.argv[3];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Usage: npx tsx scripts/seed-admin.ts <username> <password>");
  process.exit(1);
}

async function seed() {
  const sql = neon(DATABASE_URL!);

  // Create all tables
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
  await sql`
    CREATE TABLE IF NOT EXISTS custom_publications (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      journal         TEXT NOT NULL DEFAULT '',
      abstract        TEXT NOT NULL DEFAULT '',
      publication_url TEXT NOT NULL DEFAULT '',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS hidden_entities (
      entity    TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      PRIMARY KEY (entity, entity_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS custom_projects (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      about      TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS custom_researchers (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      title      TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS db_alumni (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      credentials TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(name, credentials)
    )
  `;
  console.log("Tables created.");

  // Create admin user
  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await sql`
    INSERT INTO admin_users (email, password_hash)
    VALUES (${ADMIN_EMAIL}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}
  `;
  console.log(`Admin user created: ${ADMIN_EMAIL}`);

  // Seed hidden entities (previously hardcoded in data/index.ts)
  const hiddenEntities = [
    { entity: "researcher", entity_id: "17" }, // Hardik Patel
    { entity: "researcher", entity_id: "18" }, // Viktor Toth
    { entity: "researcher", entity_id: "21" }, // Avantika Vardhan
    { entity: "researcher", entity_id: "22" }, // Fylaktis Fylaktou
    { entity: "project", entity_id: "6" },     // Website project
  ];
  for (const { entity, entity_id } of hiddenEntities) {
    await sql`
      INSERT INTO hidden_entities (entity, entity_id)
      VALUES (${entity}, ${entity_id})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log("Hidden entities seeded.");

  // Seed alumni (previously hardcoded in data/index.ts)
  const alumni = [
    { name: "Avantika Vardhan", credentials: "PhD" },
    { name: "Fylaktis Fylaktou", credentials: "PhD" },
    { name: "Hardik Patel", credentials: "DO" },
    { name: "Viktor Toth", credentials: "MS" },
    { name: "Sia Bolourani", credentials: "MD PhD" },
    { name: "Subash Padmanaban", credentials: "PhD" },
  ];
  for (const { name, credentials } of alumni) {
    await sql`
      INSERT INTO db_alumni (name, credentials)
      VALUES (${name}, ${credentials})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log("Alumni seeded.");

  console.log("\nTo update credentials, re-run:");
  console.log("  npx tsx scripts/seed-admin.ts <username> <password>");
}

seed().catch(console.error);
