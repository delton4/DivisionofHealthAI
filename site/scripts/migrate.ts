/**
 * Lightweight SQL migration runner for Neon Postgres.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts                # Apply pending migrations
 *   npx tsx scripts/migrate.ts status         # Show migration status
 *   npx tsx scripts/migrate.ts create <name>  # Create new migration file
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "../migrations");

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await sql`SELECT name FROM _migrations ORDER BY id`;
  return new Set(rows.map((r) => r.name));
}

function getPendingMigrations(applied: Set<string>): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files.filter((f) => !applied.has(f));
}

async function applyMigration(filename: string) {
  const filepath = join(MIGRATIONS_DIR, filename);
  const content = readFileSync(filepath, "utf-8").trim();
  if (!content) {
    console.log(`  Skipping empty migration: ${filename}`);
    return;
  }

  // Split into individual statements (Neon HTTP allows one per call)
  const statements = content
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  // Run inside a transaction so partial failures roll back automatically
  await sql`BEGIN`;
  try {
    for (const stmt of statements) {
      await sql.query(stmt);
    }
    await sql`INSERT INTO _migrations (name) VALUES (${filename})`;
    await sql`COMMIT`;
    console.log(`  ✓ ${filename}`);
  } catch (err) {
    await sql`ROLLBACK`;
    console.error(`  ✗ ${filename} — rolled back`);
    throw err;
  }
}

async function runMigrations() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const pending = getPendingMigrations(applied);

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  console.log(`Applying ${pending.length} migration(s):\n`);
  for (const migration of pending) {
    await applyMigration(migration);
  }
  console.log("\nDone.");
}

async function showStatus() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const allFiles = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (allFiles.length === 0) {
    console.log("No migration files found.");
    return;
  }

  console.log("Migration status:\n");
  for (const f of allFiles) {
    const status = applied.has(f) ? "✓ applied" : "○ pending";
    console.log(`  ${status}  ${f}`);
  }
  console.log(`\n${applied.size} applied, ${allFiles.length - applied.size} pending.`);
}

function createMigration(name: string) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const filename = `${timestamp}_${slug}.sql`;
  const filepath = join(MIGRATIONS_DIR, filename);

  writeFileSync(filepath, `-- Migration: ${name}\n\n`);
  console.log(`Created: migrations/${filename}`);
}

// CLI
const command = process.argv[2];

if (command === "status") {
  showStatus().catch(console.error);
} else if (command === "create") {
  const name = process.argv.slice(3).join(" ");
  if (!name) {
    console.error("Usage: npx tsx scripts/migrate.ts create <name>");
    process.exit(1);
  }
  createMigration(name);
} else {
  runMigrations().catch(console.error);
}
