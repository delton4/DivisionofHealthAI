# Backend & Server Actions Codemap

**Last Updated:** 2026-04-03  
**Entry Points:** `/src/lib/actions.ts` (Server Actions), `/src/lib/db.ts` (DB queries)

## Architecture

```
Server Actions (actions.ts)
├── Authentication
│   ├── login(formData) → createSession() → JWT cookie
│   └── logout() → deleteSession() → clear cookie
├── Text Override Mutations
│   ├── saveTextOverride(entity, entityId, field, value)
│   └── Gated by verifySession()
├── Publication CRUD
│   ├── addPublication(formData)
│   ├── deletePublication(id)
│   └── restorePublication(id)
├── Project CRUD
│   ├── addProject(formData)
│   ├── deleteProject(id)
│   └── restoreProject(id)
├── Researcher CRUD
│   ├── addResearcher(formData)
│   ├── moveResearcherToAlumni(id, name, credentials)
│   ├── restoreResearcher(id)
│   └── uploadResearcherPhoto(formData)
└── Alumni Management
    ├── addDbAlumni(name, credentials)
    └── deleteAlumni(alumniId)

Database (db.ts, server-only)
├── Connection: getDb() → neon(DATABASE_URL)
├── Override Queries
│   ├── getOverrides(entity, entityId) → Record<field: value>
│   └── getBatchOverrides(entity, ids) → Record<id: Record<field: value>>
├── Entity Management
│   ├── hideEntity(entity, entityId) → soft-delete marker
│   └── unhideEntity(entity, entityId) → restore from hidden
└── CRUD Operations
    ├── Custom Publications
    ├── Custom Projects
    ├── Custom Researchers
    └── DB Alumni

Sessions (session.ts)
├── createSession(adminId, username) → JWT cookie
├── verifySession() → payload or null
├── deleteSession() → clear cookie
└── Uses jose library for JWT signing/verification
```

## Server Actions

### Authentication

**`login(prevState, formData)`**
- **Input:** `username`, `password` from form
- **Rate limiting:** 5 attempts per 15 min per IP
- **Exponential backoff:** Delayed response on auth failure
- **Output:** `{ error: string } | null`
- **Side effect:** Creates JWT cookie + redirect on success

**`logout()`**
- **Input:** None (current session)
- **Output:** Redirects to home
- **Side effect:** Deletes session cookie

### Text Overrides

**`saveTextOverride(entity, entityId, field, value, currentPath)`**
- **Auth:** Requires valid session
- **Validation:** 
  - Entity must be in `VALID_ENTITIES` (researcher, project, publication, page)
  - Field must be in `VALID_FIELDS[entity]` or `VALID_PAGE_FIELDS[pageId]`
  - Page must be in `VALID_PAGE_IDS` (home, about, join)
- **Output:** `{ success: true } | { error: string }`
- **Side effect:** 
  - Inserts/updates row in `text_overrides` table
  - Calls `revalidatePath(currentPath)` for ISR

### Publication Management

**`addPublication(formData)`**
- **Auth:** Requires session
- **Input:** name, journal, abstract, publicationUrl
- **Validation:** name required
- **ID:** `custom-{Date.now()}`
- **Output:** Redirects to `/admin/publications`
- **Side effect:** Inserts row in `custom_publications`, revalidates paths

**`deletePublication(id)`**
- **Auth:** Requires session
- **Logic:** 
  - If `id.startsWith("custom-")` → delete row
  - Else → insert hide marker in `hidden_entities`
- **Output:** `{ success: true } | { error: string }`

**`restorePublication(id)`**
- **Auth:** Requires session
- **Logic:** Remove hide marker from `hidden_entities`
- **Output:** `{ success: true } | { error: string }`

### Project Management

Same pattern as publications:
- **`addProject(formData)`** → custom-{timestamp} ID
- **`deleteProject(id)`** → delete or hide
- **`restoreProject(id)`** → unhide

### Researcher Management

**`addResearcher(formData)`**
- **Input:** name, title
- **Validation:** name required
- **ID:** `custom-{Date.now()}`
- **Output:** Redirects to `/admin/team`

**`moveResearcherToAlumni(id, name, credentials)`**
- **Logic:** 
  1. Add to `db_alumni` table
  2. Hide from active team (soft-delete or remove custom row)
- **Output:** `{ success: true } | { error: string }`

**`deleteAlumni(alumniId)`**
- **Logic:** Remove row from `db_alumni`
- **Output:** `{ success: true } | { error: string }`

**`restoreResearcher(id)`**
- **Logic:** Remove hide marker from `hidden_entities`
- **Output:** `{ success: true } | { error: string }`

**`uploadResearcherPhoto(formData)`**
- **Auth:** Requires session
- **Input:** file (File), researcherId (string), researcherSlug (string)
- **Validation:**
  - File type in [jpeg, png, webp, gif]
  - File size < 5 MB
- **Upload:** `put()` to Vercel Blob with public access
- **Side effect:** Saves blob URL as text override on researcher `photo` field
- **Output:** `{ success: true, url: string } | { error: string }`

## Database Queries

All in `/src/lib/db.ts` marked with `"use server"` and `import "server-only"`.

### Override Queries

**`getOverrides(entity, entityId)`**
```sql
SELECT field, value FROM text_overrides
WHERE entity = ${entity} AND entity_id = ${entityId}
```
Returns: `Record<field: value>`

**`getBatchOverrides(entity, entityIds)`**
- Fetches overrides for multiple entities in one query
- Returns: `Record<entityId: Record<field: value>>`
- Used by data layer to batch-merge overrides

**`upsertOverride(entity, entityId, field, value)`**
- INSERT ... ON CONFLICT ... DO UPDATE (idempotent)

### Visibility Control

**`getHiddenEntityIds(entity)`**
- Returns set of IDs marked as hidden in `hidden_entities` table

**`hideEntity(entity, entityId)`**
- Soft-delete: insert into `hidden_entities`

**`unhideEntity(entity, entityId)`**
- Restore: delete from `hidden_entities`

### Admin User

**`getAdminByUsername(username)`**
- Returns admin by username (stored in `email` column)
- Fetches: id, email, password_hash

### Custom Publications

**`getCustomPublications()`**
- Returns all custom publications, newest first

**`addCustomPublication(pub: { id, name, journal, abstract, publicationUrl })`**

**`removeCustomPublication(id)`**
- Hard-delete (not soft-delete)

### Custom Projects

**`getCustomProjects()`**
- Returns all custom projects, newest first

**`addCustomProject(proj: { id, name, about })`**

**`removeCustomProject(id)`**
- Hard-delete

### Custom Researchers

**`getCustomResearchers()`**
- Returns all custom researchers, newest first

**`addCustomResearcher(r: { id, name, title })`**

**`removeCustomResearcher(id)`**
- Hard-delete

### Database Alumni

**`getDbAlumni()`**
- Returns all alumni from `db_alumni` table

**`addDbAlumni(name, credentials)`**
- ON CONFLICT (name, credentials) DO NOTHING (idempotent)

**`removeDbAlumni(id)`**
- Hard-delete by row ID

## Sessions & Authentication

### JWT Implementation

**`createSession(adminId, username)`**
- Encrypts payload `{ sub: adminId, email: username }` with `jose`
- Sets `session` cookie (JWT payload encrypted)
- Sets `admin_logged_in` cookie (hint flag for client)

**`verifySession()`**
- Reads `session` cookie
- Decrypts and validates JWT
- Returns payload or null

**`deleteSession()`**
- Clears both `session` and `admin_logged_in` cookies

### Secret & Environment

- Uses `process.env.SESSION_SECRET` for JWT encryption
- Must be 32+ characters (checked at startup)
- Session cookie is HTTP-only, Secure (production)

## Error Handling

### Try/Catch Pattern

All DB operations wrapped in try/catch:
```typescript
try {
  const sql = getDb();
  // ... query
} catch {
  return []; // or {} or null (graceful degradation)
}
```

### Server Action Error Responses

- Return `{ error: "message" }` on validation failure
- Throw Error on unexpected failure (caught by error.tsx)
- Rate limit exceeded → return error message

### Database Unavailable

- `GITHUB_ACTIONS=true` → returns empty/default (static export mode)
- Production DB down → catches error, returns empty, site still renders with static JSON

## Performance Considerations

### Rate Limiting

Login attempts tracked in-memory with IP-based limits:
- Max 5 attempts per 15 minutes
- Old entries pruned when map exceeds 1000 entries
- Exponential backoff delay: 1s → 2s → 4s → 8s (capped)

### Batch Queries

- `getBatchOverrides()` fetches all overrides for multiple entities in one query
- Data layer uses this to minimize DB roundtrips

### Revalidation Strategy

- `revalidatePath()` called after mutations
- Invalidates ISR cache for affected routes only
- Example: saving publication override revalidates `/publications`, `/admin/publications`, `/`

## Input Validation

### Field Validation

Whitelists prevent arbitrary field updates:
```typescript
const VALID_FIELDS: Record<string, Set<string>> = {
  researcher: new Set(["name", "title", "about", "photo", "credentials"]),
  project: new Set(["name", "about"]),
  publication: new Set(["name", "journal", "abstract", "publicationUrl"]),
};
```

### Page Field Validation

Different pages have different editable fields:
- `home` — subtitle, highlight_desc
- `about` — intro1, intro2, approach1, approach2, achieve*
- `join` — intro, scholar_desc, collab_desc, location_desc

### File Upload Validation

- MIME type whitelist (jpeg, png, webp, gif)
- Size limit 5 MB
- Filename includes timestamp to prevent collisions
