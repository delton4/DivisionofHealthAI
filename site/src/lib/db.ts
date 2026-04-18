import "server-only";
import { neon } from "@neondatabase/serverless";

// ---- Row types for typed SELECT queries ----

export interface CustomPublicationRow {
  id: string;
  name: string;
  journal: string;
  abstract: string;
  publication_url: string;
  created_at: string;
}

export interface CustomProjectRow {
  id: string;
  name: string;
  about: string;
  created_at: string;
}

export interface CustomResearcherRow {
  id: string;
  name: string;
  title: string;
  created_at: string;
}

export interface DbAlumniRow {
  id: number;
  name: string;
  credentials: string;
  created_at: string;
}

type NeonSql = ReturnType<typeof neon<false, false>>;
let cachedSql: NeonSql | null = null;

function getDb(): NeonSql {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cachedSql = neon(url);
  return cachedSql;
}

// ---- Rate limiting ----

const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function checkRateLimit(key: string): Promise<boolean> {
  try {
    const sql = getDb();
    const rows = (await sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start + ${`${RATE_LIMIT_WINDOW_MINUTES} minutes`}::interval < now()
          THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start + ${`${RATE_LIMIT_WINDOW_MINUTES} minutes`}::interval < now()
          THEN now()
          ELSE rate_limits.window_start
        END
      RETURNING count
    `) as unknown as { count: number }[];
    return (rows[0]?.count ?? 1) <= MAX_LOGIN_ATTEMPTS;
  } catch {
    // If rate limit check fails, allow the attempt (fail open)
    return true;
  }
}

// ---- Audit log ----

export interface AuditLogRow {
  id: number;
  action: string;
  entity: string;
  entity_id: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

async function logAudit(entry: {
  action: string;
  entity: string;
  entityId: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}) {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO audit_log (action, entity, entity_id, field, old_value, new_value)
      VALUES (
        ${entry.action},
        ${entry.entity},
        ${entry.entityId},
        ${entry.field ?? null},
        ${entry.oldValue ?? null},
        ${entry.newValue ?? null}
      )
    `;
  } catch {
    // Audit logging should never break the main operation
  }
}

export async function getAuditLog(limit = 100): Promise<AuditLogRow[]> {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, action, entity, entity_id, field, old_value, new_value, created_at
      FROM audit_log ORDER BY created_at DESC LIMIT ${limit}
    `;
    return rows as unknown as AuditLogRow[];
  } catch {
    return [];
  }
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

export async function getBatchOverrides(
  entity: string,
  entityIds: string[]
): Promise<Record<string, Record<string, string>>> {
  if (process.env.GITHUB_ACTIONS === "true") return {};
  if (entityIds.length === 0) return {};

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT entity_id, field, value FROM text_overrides
      WHERE entity = ${entity} AND entity_id = ANY(${entityIds})
    `;
    const result: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!result[row.entity_id]) result[row.entity_id] = {};
      result[row.entity_id][row.field] = row.value;
    }
    return result;
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
  const existing = await sql`
    SELECT value FROM text_overrides
    WHERE entity = ${entity} AND entity_id = ${entityId} AND field = ${field}
  `;
  const oldValue = existing[0]?.value ?? null;

  await sql`
    INSERT INTO text_overrides (entity, entity_id, field, value, updated_at)
    VALUES (${entity}, ${entityId}, ${field}, ${value}, NOW())
    ON CONFLICT (entity, entity_id, field)
    DO UPDATE SET value = ${value}, updated_at = NOW()
  `;

  await logAudit({
    action: oldValue ? "update" : "create",
    entity,
    entityId,
    field,
    oldValue,
    newValue: value,
  });
}

export async function getAdminByUsername(username: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${username}
  `;
  return rows[0] || null;
}

// ---- Publication management ----

export async function getCustomPublications(): Promise<CustomPublicationRow[]> {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT id, name, journal, abstract, publication_url, created_at FROM custom_publications ORDER BY created_at DESC`;
    return rows as unknown as CustomPublicationRow[];
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
  await logAudit({
    action: "create",
    entity: "publication",
    entityId: pub.id,
    newValue: pub.name,
  });
}

export async function removeCustomPublication(id: string) {
  const sql = getDb();
  const existing = await sql`SELECT name FROM custom_publications WHERE id = ${id}`;
  await sql`DELETE FROM custom_publications WHERE id = ${id}`;
  await logAudit({
    action: "delete",
    entity: "publication",
    entityId: id,
    oldValue: existing[0]?.name ?? null,
  });
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
  await logAudit({ action: "hide", entity, entityId });
}

export async function unhideEntity(entity: string, entityId: string) {
  const sql = getDb();
  await sql`DELETE FROM hidden_entities WHERE entity = ${entity} AND entity_id = ${entityId}`;
  await logAudit({ action: "unhide", entity, entityId });
}

// ---- Custom projects ----

export async function getCustomProjects(): Promise<CustomProjectRow[]> {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT id, name, about, created_at FROM custom_projects ORDER BY created_at DESC`;
    return rows as unknown as CustomProjectRow[];
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
  await logAudit({
    action: "create",
    entity: "project",
    entityId: proj.id,
    newValue: proj.name,
  });
}

export async function removeCustomProject(id: string) {
  const sql = getDb();
  const existing = await sql`SELECT name FROM custom_projects WHERE id = ${id}`;
  await sql`DELETE FROM custom_projects WHERE id = ${id}`;
  await logAudit({
    action: "delete",
    entity: "project",
    entityId: id,
    oldValue: existing[0]?.name ?? null,
  });
}

// ---- Custom researchers ----

export async function getCustomResearchers(): Promise<CustomResearcherRow[]> {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT id, name, title, created_at FROM custom_researchers ORDER BY created_at DESC`;
    return rows as unknown as CustomResearcherRow[];
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
  await logAudit({
    action: "create",
    entity: "researcher",
    entityId: r.id,
    newValue: r.name,
  });
}

export async function removeCustomResearcher(id: string) {
  const sql = getDb();
  const existing = await sql`SELECT name FROM custom_researchers WHERE id = ${id}`;
  await sql`DELETE FROM custom_researchers WHERE id = ${id}`;
  await logAudit({
    action: "delete",
    entity: "researcher",
    entityId: id,
    oldValue: existing[0]?.name ?? null,
  });
}

// ---- Dynamic alumni (database-stored) ----

export async function getDbAlumni(): Promise<DbAlumniRow[]> {
  if (process.env.GITHUB_ACTIONS === "true") return [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT id, name, credentials, created_at FROM db_alumni ORDER BY created_at DESC`;
    return rows as unknown as DbAlumniRow[];
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
  await logAudit({
    action: "create",
    entity: "alumni",
    entityId: name,
    newValue: `${name}, ${credentials}`,
  });
}

export async function removeDbAlumni(id: number) {
  const sql = getDb();
  const existing = await sql`SELECT name FROM db_alumni WHERE id = ${id}`;
  await sql`DELETE FROM db_alumni WHERE id = ${id}`;
  await logAudit({
    action: "delete",
    entity: "alumni",
    entityId: String(id),
    oldValue: existing[0]?.name ?? null,
  });
}

// ---- Association overrides (researcher ↔ publication/project) ----

export interface AssociationOverrideResult {
  additions: Set<string>;
  removals: Set<string>;
}

export async function getAssociationOverrides(
  researcherId: string,
  entityType: "publication" | "project"
): Promise<AssociationOverrideResult> {
  if (process.env.GITHUB_ACTIONS === "true")
    return { additions: new Set(), removals: new Set() };
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT entity_id, action FROM association_overrides
      WHERE researcher_id = ${researcherId} AND entity_type = ${entityType}
    `;
    const additions = new Set<string>();
    const removals = new Set<string>();
    for (const row of rows) {
      if (row.action === "add") additions.add(row.entity_id);
      else removals.add(row.entity_id);
    }
    return { additions, removals };
  } catch {
    return { additions: new Set(), removals: new Set() };
  }
}

export async function getAssociationOverridesByEntity(
  entityType: "publication" | "project",
  entityId: string
): Promise<AssociationOverrideResult> {
  if (process.env.GITHUB_ACTIONS === "true")
    return { additions: new Set(), removals: new Set() };
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT researcher_id, action FROM association_overrides
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    `;
    const additions = new Set<string>();
    const removals = new Set<string>();
    for (const row of rows) {
      if (row.action === "add") additions.add(row.researcher_id);
      else removals.add(row.researcher_id);
    }
    return { additions, removals };
  } catch {
    return { additions: new Set(), removals: new Set() };
  }
}

export async function upsertAssociationOverride(
  researcherId: string,
  entityType: "publication" | "project",
  entityId: string,
  action: "add" | "remove"
) {
  const sql = getDb();
  await sql`
    INSERT INTO association_overrides (researcher_id, entity_type, entity_id, action)
    VALUES (${researcherId}, ${entityType}, ${entityId}, ${action})
    ON CONFLICT (researcher_id, entity_type, entity_id)
    DO UPDATE SET action = ${action}, created_at = NOW()
  `;
  await logAudit({
    action: action === "add" ? "link" : "unlink",
    entity: entityType,
    entityId,
    field: "researcherId",
    newValue: researcherId,
  });
}

export async function deleteAssociationOverride(
  researcherId: string,
  entityType: "publication" | "project",
  entityId: string
) {
  const sql = getDb();
  await sql`
    DELETE FROM association_overrides
    WHERE researcher_id = ${researcherId}
      AND entity_type = ${entityType}
      AND entity_id = ${entityId}
  `;
  await logAudit({
    action: "restore_link",
    entity: entityType,
    entityId,
    field: "researcherId",
    newValue: researcherId,
  });
}
