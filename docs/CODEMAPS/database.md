# Database & Schema Codemap

**Last Updated:** 2026-04-03  
**Database:** Neon Postgres (serverless)  
**Package:** `@neondatabase/serverless`

## Architecture

```
Connection Pool
├── DATABASE_URL (serverless connection string)
└── neon(url) → sql query interface

Tables
├── admin_users (authentication)
├── text_overrides (content customization)
├── hidden_entities (soft-delete markers)
├── custom_researchers, custom_projects, custom_publications (user-created content)
└── db_alumni (alumni records)
```

## Tables

### admin_users

**Purpose:** Store admin login credentials

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial PRIMARY KEY | | Auto-incrementing |
| email | varchar(255) UNIQUE NOT NULL | | Username stored here (not email) |
| password_hash | varchar(255) NOT NULL | | bcryptjs hash |
| created_at | timestamp DEFAULT NOW() | | Creation date |
| updated_at | timestamp DEFAULT NOW() | | Last modified |

**Indexes:** PRIMARY KEY (id), UNIQUE (email)

**Created by:** `npx tsx scripts/seed-admin.ts <username> <password>`

**Queries:**
```sql
SELECT id, email, password_hash FROM admin_users WHERE email = $1;
```

### text_overrides

**Purpose:** Store per-field overrides for any entity (researchers, projects, publications, pages)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| entity | varchar(50) NOT NULL | | Type: researcher, project, publication, page |
| entity_id | varchar(255) NOT NULL | | Entity ID or page name |
| field | varchar(255) NOT NULL | | Field name being overridden |
| value | text NOT NULL | | Override value (any length) |
| updated_at | timestamp DEFAULT NOW() | | When last changed |

**Primary Key:** `(entity, entity_id, field)`

**Indexes:** PRIMARY KEY (composite), possibly idx on entity + entity_id

**Sample rows:**
```
(researcher, 1, name, "Dr. Jane Smith")
(researcher, 1, photo, "https://blob.vercelusercontent.com/...")
(publication, 5, journal, "Nature Machine Intelligence")
(page, home, subtitle, "Custom headline text")
```

**Queries:**
```sql
SELECT field, value FROM text_overrides
WHERE entity = $1 AND entity_id = $2;

SELECT entity_id, field, value FROM text_overrides
WHERE entity = $1 AND entity_id = ANY($2);

INSERT INTO text_overrides (entity, entity_id, field, value, updated_at)
VALUES ($1, $2, $3, $4, NOW())
ON CONFLICT (entity, entity_id, field) DO UPDATE SET value = $4, updated_at = NOW();
```

### hidden_entities

**Purpose:** Soft-delete marker for static JSON entities (hide from public view but keep in DB)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| entity | varchar(50) NOT NULL | | Type: researcher, project, publication |
| entity_id | varchar(255) NOT NULL | | ID of static entity |

**Primary Key:** `(entity, entity_id)`

**Sample rows:**
```
(researcher, 3)
(project, 2)
(publication, 10)
```

When a hidden entity's ID appears in queries, it's filtered out.

**Queries:**
```sql
SELECT entity_id FROM hidden_entities WHERE entity = $1;

INSERT INTO hidden_entities (entity, entity_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

DELETE FROM hidden_entities WHERE entity = $1 AND entity_id = $2;
```

### custom_researchers

**Purpose:** Store admin-created researcher records

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | varchar(255) PRIMARY KEY | | Format: `custom-{timestamp}` |
| name | varchar(255) NOT NULL | | Researcher name |
| title | varchar(255) | | Job title, e.g., "Research Scientist" |
| created_at | timestamp DEFAULT NOW() | | Creation date |

**Indexes:** PRIMARY KEY (id)

**Immutable:** Once created, edit only via text_overrides

**Queries:**
```sql
SELECT * FROM custom_researchers ORDER BY created_at DESC;

INSERT INTO custom_researchers (id, name, title)
VALUES ($1, $2, $3);

DELETE FROM custom_researchers WHERE id = $1;
```

### custom_projects

**Purpose:** Store admin-created project records

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | varchar(255) PRIMARY KEY | | Format: `custom-{timestamp}` |
| name | varchar(255) NOT NULL | | Project name |
| about | text | | Project description |
| created_at | timestamp DEFAULT NOW() | | Creation date |

**Indexes:** PRIMARY KEY (id)

**Immutable:** Once created, edit only via text_overrides

**Queries:**
```sql
SELECT * FROM custom_projects ORDER BY created_at DESC;

INSERT INTO custom_projects (id, name, about)
VALUES ($1, $2, $3);

DELETE FROM custom_projects WHERE id = $1;
```

### custom_publications

**Purpose:** Store admin-created publication records

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | varchar(255) PRIMARY KEY | | Format: `custom-{timestamp}` |
| name | varchar(255) NOT NULL | | Publication title |
| journal | varchar(255) | | Journal name |
| abstract | text | | Paper abstract |
| publication_url | varchar(2048) | | External link (DOI/PubMed/etc.) |
| created_at | timestamp DEFAULT NOW() | | Creation date |

**Indexes:** PRIMARY KEY (id)

**Immutable:** Once created, edit only via text_overrides

**Queries:**
```sql
SELECT * FROM custom_publications ORDER BY created_at DESC;

INSERT INTO custom_publications (id, name, journal, abstract, publication_url)
VALUES ($1, $2, $3, $4, $5);

DELETE FROM custom_publications WHERE id = $1;
```

### db_alumni

**Purpose:** Store alumni records (managed entirely in DB, no static JSON)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial PRIMARY KEY | | Auto-incrementing |
| name | varchar(255) NOT NULL | | Alumni name |
| credentials | varchar(255) NOT NULL | | Credentials: "PhD, MD", etc. |
| created_at | timestamp DEFAULT NOW() | | Creation date |

**Unique Key:** `(name, credentials)`

**Sample rows:**
```
(1, John Doe, PhD)
(2, Jane Smith, MD, PhD)
```

**Queries:**
```sql
SELECT * FROM db_alumni ORDER BY created_at DESC;

INSERT INTO db_alumni (name, credentials)
VALUES ($1, $2)
ON CONFLICT (name, credentials) DO NOTHING;

DELETE FROM db_alumni WHERE id = $1;
```

## Schema Migrations

**Location:** `site/migrations/` (created by migrations tooling)

**Run migrations:**
```bash
npx tsx scripts/migrate.ts           # Apply pending migrations
npx tsx scripts/migrate.ts status    # Show current state
npx tsx scripts/migrate.ts create <name>  # Create new migration
```

**Initial schema:** Created by `seed-admin.ts` if tables don't exist

## Connection & Error Handling

### Connection

```typescript
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
```

- Serverless connection (scales to zero when idle)
- No connection pooling needed (handled by Vercel)
- Environment variable required

### Graceful Degradation

All DB queries wrapped in try/catch:

```typescript
try {
  const sql = getDb();
  return await sql`SELECT * FROM custom_researchers`;
} catch {
  return [];  // Return empty on failure
}
```

Site still works with static JSON if DB unavailable.

### Static Export Mode

When `process.env.GITHUB_ACTIONS === "true"`:
- All DB queries return empty immediately
- No connection attempted
- Used for static HTML builds

## Relationships & Foreign Keys

**No explicit foreign keys** — design allows flexibility:

- Researchers reference publications via `publicationIds` array (in JSON)
- Projects reference researchers via `researcherIds` array (in JSON)
- Custom entities have minimal relationships (managed via text_overrides)

**Example data consistency:**
- Researcher ID "1" in `researchers.json` has `publicationIds: ["1", "5"]`
- These IDs reference publications in `publications.json`
- Admin cannot delete publication but can hide it

## Query Performance

### N+1 Avoidance

Data layer uses batch queries:

```typescript
// Efficient: single query for all overrides
const allOverrides = await getBatchOverrides("researcher", [ids...]);

// Inefficient (not used):
for (const id of ids) {
  const overrides = await getOverrides("researcher", id);  // N queries!
}
```

### Indexes

- PRIMARY KEY indexes on all tables
- UNIQUE constraints on admin_users.email, db_alumni (name, credentials)
- Consider adding index on (entity, entity_id) for text_overrides if that table grows large

### Query Examples

**Fetch override for single field:**
```sql
SELECT value FROM text_overrides
WHERE entity = 'researcher' AND entity_id = '1' AND field = 'photo';
```

**Fetch all overrides for entity:**
```sql
SELECT * FROM text_overrides WHERE entity = 'researcher' AND entity_id = '1';
```

**Hide entity:**
```sql
INSERT INTO hidden_entities (entity, entity_id) VALUES ('researcher', '3');
```

**Show all non-hidden researchers:**
```sql
-- In app code:
const hidden = await getHiddenEntityIds('researcher');
researchers.filter(r => !hidden.has(r.id));
```

## Environment Configuration

**Required environment variable:**
```
DATABASE_URL=postgresql://[user[:password]@][host][:port][/database][?param1=value1&...]
```

For Neon:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require
```

**SESSION_SECRET:**
```
SESSION_SECRET=<32+ character secret for JWT encryption>
```

## Backup & Recovery

Neon Postgres provides:
- Automatic backups (retention varies by plan)
- Point-in-time recovery
- Read replicas for high-availability

Admin should regularly:
- Test database connectivity
- Monitor quota usage
- Review migration status

## Data Retention

**Static content:** Lives in git repo, always recoverable

**Dynamic content:** 
- text_overrides — can be regenerated from admin UI
- custom_* — user-created, important to back up
- db_alumni — user-created, important to back up
- hidden_entities — deletion markers, temporary

**Retention strategy:** Let Neon handle PITR, keep git commits as source of truth for schema
