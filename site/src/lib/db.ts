import "server-only";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
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

export async function getAdminByUsername(username: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${username}
  `;
  return rows[0] || null;
}

// ---- Publication management ----

export async function getCustomPublications() {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    return await sql`SELECT * FROM custom_publications ORDER BY created_at DESC`;
  } catch {
    return [];
  }
}

export async function addCustomPublication(pub: {
  id: string;
  name: string;
  journal: string;
  abstract: string;
  publicationUrl: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO custom_publications (id, name, journal, abstract, publication_url)
    VALUES (${pub.id}, ${pub.name}, ${pub.journal}, ${pub.abstract}, ${pub.publicationUrl})
  `;
}

export async function removeCustomPublication(id: string) {
  const sql = getDb();
  await sql`DELETE FROM custom_publications WHERE id = ${id}`;
}

export async function getHiddenEntityIds(entity: string): Promise<Set<string>> {
  if (process.env.GITHUB_ACTIONS === "true") return new Set();
  try {
    const sql = getDb();
    const rows = await sql`SELECT entity_id FROM hidden_entities WHERE entity = ${entity}`;
    return new Set(rows.map((r) => r.entity_id));
  } catch {
    return new Set();
  }
}

export async function hideEntity(entity: string, entityId: string) {
  const sql = getDb();
  await sql`
    INSERT INTO hidden_entities (entity, entity_id)
    VALUES (${entity}, ${entityId})
    ON CONFLICT DO NOTHING
  `;
}

export async function unhideEntity(entity: string, entityId: string) {
  const sql = getDb();
  await sql`DELETE FROM hidden_entities WHERE entity = ${entity} AND entity_id = ${entityId}`;
}

// ---- Custom projects ----

export async function getCustomProjects() {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    return await sql`SELECT * FROM custom_projects ORDER BY created_at DESC`;
  } catch {
    return [];
  }
}

export async function addCustomProject(proj: {
  id: string;
  name: string;
  about: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO custom_projects (id, name, about)
    VALUES (${proj.id}, ${proj.name}, ${proj.about})
  `;
}

export async function removeCustomProject(id: string) {
  const sql = getDb();
  await sql`DELETE FROM custom_projects WHERE id = ${id}`;
}

// ---- Custom researchers ----

export async function getCustomResearchers() {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    return await sql`SELECT * FROM custom_researchers ORDER BY created_at DESC`;
  } catch {
    return [];
  }
}

export async function addCustomResearcher(r: {
  id: string;
  name: string;
  title: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO custom_researchers (id, name, title)
    VALUES (${r.id}, ${r.name}, ${r.title})
  `;
}

export async function removeCustomResearcher(id: string) {
  const sql = getDb();
  await sql`DELETE FROM custom_researchers WHERE id = ${id}`;
}

// ---- Dynamic alumni (database-stored) ----

export async function getDbAlumni() {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    return await sql`SELECT * FROM db_alumni ORDER BY created_at DESC`;
  } catch {
    return [];
  }
}

export async function addDbAlumni(name: string, credentials: string) {
  const sql = getDb();
  await sql`
    INSERT INTO db_alumni (name, credentials)
    VALUES (${name}, ${credentials})
    ON CONFLICT (name, credentials) DO NOTHING
  `;
}

export async function removeDbAlumni(id: number) {
  const sql = getDb();
  await sql`DELETE FROM db_alumni WHERE id = ${id}`;
}
