import { hash } from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = process.argv[2] || "admin@healthai.northwell.edu";
const ADMIN_PASSWORD = process.argv[3] || "changeme123";

async function seed() {
  const sql = neon(DATABASE_URL!);

  // Create tables
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

  // Create admin user
  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await sql`
    INSERT INTO admin_users (email, password_hash)
    VALUES (${ADMIN_EMAIL}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}
  `;

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("\nChange these credentials by running:");
  console.log("  npx tsx scripts/seed-admin.ts your@email.com yourpassword");
}

seed().catch(console.error);
