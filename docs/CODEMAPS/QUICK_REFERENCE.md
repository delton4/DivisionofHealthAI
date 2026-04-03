# Quick Reference Guide

**Bookmark this page for fast lookup of common patterns and file locations.**

## Common Tasks

### Add a new page

1. Create `/src/app/[path]/page.tsx` as Server Component
2. Import data functions from `@/data`
3. Export `revalidate = 60` for ISR
4. Use `EditableText` for editable fields (visible to admins)
5. See **[frontend.md](./frontend.md)** for examples

### Add a database table

1. Create migration: `npx tsx scripts/migrate.ts create table_name`
2. Write SQL in `migrations/` file
3. Run: `npx tsx scripts/migrate.ts`
4. Add query functions to `/src/lib/db.ts`
5. See **[database.md](./database.md)** for schema reference

### Add a Server Action (mutation)

1. Add function to `/src/lib/actions.ts`
2. Mark with `"use server"`
3. Call `verifySession()` to gate access
4. Call `revalidatePath()` on success
5. Return `{ success: true }` or `{ error: "message" }`
6. See **[backend.md](./backend.md)** for examples

### Allow admins to edit a field

1. Wrap text with `<EditableText entity="..." entityId="..." field="..." />`
2. Field name must be in `VALID_FIELDS` in `actions.ts`
3. Component handles save via `saveTextOverride()` action
4. Text is stored in `text_overrides` table
5. See **[admin.md](./admin.md)** for details

### Upload a file (photo)

1. Use `<PhotoUpload researcherId="..." researcherSlug="..." />`
2. Component validates (type, size)
3. Uploads to Vercel Blob
4. Stores URL as text override on `photo` field
5. See **[admin.md](./admin.md)** for details

### Hide/restore an entity

1. Static entity (ID is numeric):
   - Hide: Insert into `hidden_entities`
   - Restore: Delete from `hidden_entities`
2. Custom entity (ID is `custom-...`):
   - Delete: Remove from `custom_*` table
   - Restore: Not possible (hard-deleted)
3. See **[backend.md](./backend.md)** for action code

### Move researcher to alumni

1. Get researcher ID, name, credentials
2. Call `moveResearcherToAlumni(id, name, credentials)`
3. Inserts to `db_alumni`, hides from active team
4. Appears on `/team` page in alumni section
5. See **[admin.md](./admin.md)** for workflow

## File Locations

| Task | File |
|------|------|
| Add page | `/src/app/[path]/page.tsx` |
| Add component | `/src/components/[Name].tsx` |
| Add Server Action | `/src/lib/actions.ts` |
| Add DB query | `/src/lib/db.ts` |
| Add type | `/src/lib/types.ts` |
| Add hook | `/src/hooks/[useName].ts` |
| Static content | `/src/data/*.json` |
| Data merging | `/src/data/index.ts` |
| Styling | `/src/app/globals.css` |
| Config | `next.config.js`, `tailwind.config.js`, `tsconfig.json` |
| Database migration | `migrations/` |
| Scripts | `scripts/` |

## Key Patterns

### Fetching data in a page

```typescript
import { getAllResearchersWithOverrides } from "@/data";

export default async function MyPage() {
  const researchers = await getAllResearchersWithOverrides();
  return <div>...</div>;
}
```

### Server Action with validation

```typescript
"use server";
import { verifySession } from "@/lib/session";

export async function myAction(formData: FormData) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };
  
  const value = formData.get("field");
  if (!value) return { error: "Field required." };
  
  // ... do something ...
  return { success: true };
}
```

### Editable field for admins

```typescript
<EditableText
  entity="researcher"
  entityId="1"
  field="title"
  value={researcher.title}
  as="p"
  className="text-sm"
/>
```

### Data filtering with overrides

```typescript
// Merge static JSON + DB overrides + filter hidden
const allResearchers = await getAllResearchersWithOverrides();
// Returns array with:
// - Static researchers (filtered if hidden)
// - Custom researchers (from DB)
// - All with text overrides applied
```

### Add custom entity

```typescript
// ID: custom-{timestamp}
const id = `custom-${Date.now()}`;
await addCustomResearcher({ id, name, title });
// Appears in queries immediately
```

## Database Quick Reference

### Check if entity hidden

```sql
SELECT * FROM hidden_entities WHERE entity = 'researcher' AND entity_id = '1';
```

### Check text override

```sql
SELECT * FROM text_overrides 
WHERE entity = 'researcher' AND entity_id = '1' AND field = 'name';
```

### View custom entities

```sql
SELECT * FROM custom_researchers;
SELECT * FROM custom_projects;
SELECT * FROM custom_publications;
```

### View alumni

```sql
SELECT * FROM db_alumni;
```

### View admin users

```sql
SELECT id, email FROM admin_users;
```

## Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://...` | Neon Postgres connection |
| `SESSION_SECRET` | 32+ chars | JWT encryption secret |
| `BLOB_READ_WRITE_TOKEN` | token | Vercel Blob authentication |
| `GITHUB_ACTIONS` | `true` | Static export mode flag |

## Development Commands

```bash
npm run dev                                    # Start dev server
npm run build                                  # Production build
npm run lint                                   # ESLint check
npx tsx scripts/seed-admin.ts user pass       # Create admin + seed DB
npx tsx scripts/migrate.ts                     # Run migrations
npx tsx scripts/migrate.ts status              # Check migration status
npx tsx scripts/migrate.ts create migration    # Create new migration
```

## Validation Rules

### Valid entity types

```
"researcher", "project", "publication", "page"
```

### Valid researcher fields

```
name, title, about, photo, credentials
```

### Valid project fields

```
name, about
```

### Valid publication fields

```
name, journal, abstract, publicationUrl
```

### Valid page IDs

```
"home", "about", "join"
```

### File upload constraints

- **Types:** JPEG, PNG, WebP, GIF only
- **Max size:** 5 MB
- **Storage:** Vercel Blob (public URLs)

## Entity ID Formats

| Type | Format | Example | Mutable |
|------|--------|---------|---------|
| Static researcher | Numeric string | `"1"` | Overridable via text_overrides |
| Custom researcher | `custom-{timestamp}` | `"custom-1712102400000"` | Deletable |
| Static project | Numeric string | `"5"` | Overridable via text_overrides |
| Custom project | `custom-{timestamp}` | `"custom-1712102400000"` | Deletable |
| Static publication | Numeric string | `"10"` | Overridable via text_overrides |
| Custom publication | `custom-{timestamp}` | `"custom-1712102400000"` | Deletable |

## Useful TypeScript Types

```typescript
import type { Researcher, Project, Publication, Alumni } from "@/lib/types";

interface Researcher {
  id: string;
  name: string;
  title: string;
  about: string;
  slug: string;
  projectIds: string[];
  publicationIds: string[];
  image: string;
  email?: string;
  linkedin?: string;
  photo?: string; // Override image URL
}

interface Project {
  id: string;
  name: string;
  about: string;
  slug: string;
  researcherIds: string[];
  publicationIds: string[];
  image: string;
}

interface Publication {
  id: string;
  name: string;
  journal: string;
  abstract: string;
  slug: string;
  publicationUrl: string;
  researcherIds: string[];
  projectIds: string[];
  image: string;
}

interface Alumni {
  name: string;
  credentials: string;
}
```

## Performance Tips

1. **Use batch queries:** `getBatchOverrides()` over N `getOverrides()` calls
2. **Leverage ISR:** 60-second revalidation keeps pages fresh
3. **Filter early:** Remove hidden entities before rendering
4. **Graceful fallback:** DB errors return empty, site still works
5. **Rate limiting:** Login protected (5 attempts / 15 min)

## Debugging Tips

### Content not showing

1. Check if entity is hidden: `SELECT * FROM hidden_entities WHERE entity_id = '...';`
2. Check if override exists: `SELECT * FROM text_overrides WHERE entity_id = '...';`
3. Check DB unavailable: logs will show `GITHUB_ACTIONS` or catch block
4. Wait 60s for ISR revalidation

### Admin UI not visible

1. Check `admin_logged_in` cookie in DevTools
2. Check `session` cookie exists (JWT)
3. Check console for errors
4. Try logging in again

### Photo upload fails

1. Check file type (JPEG, PNG, WebP, GIF)
2. Check file size (<5 MB)
3. Check `BLOB_READ_WRITE_TOKEN` env var
4. Check browser network tab for upload response

### Database connection fails

1. Check `DATABASE_URL` is set correctly
2. Check Neon connection limit not exceeded
3. Check IP whitelisting (Neon)
4. Fallback: site still works with static JSON

## Related Documentation

- **CLAUDE.md** — Full project guide
- **[frontend.md](./frontend.md)** — Page & component structure
- **[backend.md](./backend.md)** — Server Actions & auth
- **[data.md](./data.md)** — Data merging strategy
- **[admin.md](./admin.md)** — CMS implementation
- **[database.md](./database.md)** — Schema reference
- **[README.md](./README.md)** — Complete guide

---

**Updated:** 2026-04-03
