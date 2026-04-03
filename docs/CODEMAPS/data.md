# Data Layer Codemap

**Last Updated:** 2026-04-03  
**Entry Points:** `/src/data/index.ts` (public API), `/src/lib/db.ts` (DB queries)

## Architecture: Hybrid Static + Dynamic

```
Data Request
└── /src/data/index.ts (getAll*WithOverrides, get*WithOverrides)
    ├── Load Static JSON
    │   └── researchers.json, projects.json, publications.json
    ├── Dynamic Import & Query DB (wrapped in try/catch)
    │   ├── getCustom*() → Fetch user-created entities
    │   ├── getHiddenEntityIds() → Fetch soft-delete markers
    │   └── getBatchOverrides() → Fetch text field overrides
    └── Merge & Return
        ├── Filter hidden IDs
        ├── Append custom entities
        └── Apply text overrides per field
```

## Data Types

### Researcher

```typescript
interface Researcher {
  id: string;              // "1" (static) or "custom-1712102400000" (dynamic)
  name: string;
  title: string;           // e.g., "Director of Health AI"
  about: string;           // Bio text
  slug: string;            // URL slug for /team/[slug]
  projectIds: string[];    // IDs of associated projects
  publicationIds: string[]; // IDs of associated publications
  image: string;           // Original image URL
  email?: string;
  linkedin?: string;
  alumni?: boolean;        // If true, hide from active team (deprecated)
  photo?: string;          // Override image URL from photo upload
}
```

### Project

```typescript
interface Project {
  id: string;              // "1" (static) or "custom-1712102400000" (dynamic)
  name: string;
  about: string;
  slug: string;            // URL slug for /research/[slug]
  researcherIds: string[]; // Associated researchers
  publicationIds: string[]; // Associated publications
  image: string;           // Image URL
}
```

### Publication

```typescript
interface Publication {
  id: string;              // "1" (static) or "custom-1712102400000" (dynamic)
  name: string;            // Paper title
  journal: string;         // Journal name
  abstract: string;        // Summary
  slug: string;            // URL slug (though publications don't have detail page)
  publicationUrl: string;  // External link (DOI/PubMed/etc)
  researcherIds: string[]; // Associated researchers
  projectIds: string[];    // Associated projects
  image: string;           // Cover/logo image
}
```

### Alumni

```typescript
interface Alumni {
  name: string;
  credentials: string;     // "PhD, MD" etc
}
```

## Data Access Functions

### Single Entity Retrieval with Overrides

**`getResearcherWithOverrides(slug: string)`**
- Find by slug in static JSON
- Filter if hidden
- Merge text overrides
- Return merged entity or undefined

**`getProjectWithOverrides(slug: string)`**
- Find by slug in static JSON
- Filter if hidden
- Merge text overrides
- Return merged entity or undefined

### Batch Entity Retrieval with Overrides

**`getAllResearchersWithOverrides()`**
1. Copy all researchers from static JSON
2. Try to fetch custom researchers from DB (catch if unavailable)
3. Fetch hidden IDs from DB, filter them out
4. Append custom researchers with minimal props
   - `id`, `name`, `title` from DB row
   - `about`, `slug`, `projectIds`, `publicationIds`, `image`, `photo` = empty/default
5. Batch-fetch overrides for all IDs
6. Apply overrides to each entity
7. Return merged array

**`getAllProjectsWithOverrides()`**
- Same pattern: static + custom + hidden filtering + override merging

**`getAllPublicationsWithOverrides()`**
- Same pattern but custom pubs added to front (unshift vs push)

**`getAllAlumni()`**
- Fetch all rows from `db_alumni` table
- Map to `Alumni` interface (name, credentials)

### Page Text Overrides

**`getPageOverrides(pageId: string)`**
- Fetch text overrides for a specific page (home, about, join)
- Returns `Record<fieldName: value>` for that page
- Used to override page intro text, section descriptions, etc.

### Helper Functions

**`getResearchersByIds(ids: string[])`**
- Filter static researchers by ID array
- Apply hidden filter
- Return matching subset

**`getProjectsByIds(ids: string[])`**
- Filter static projects by ID array
- Apply hidden filter
- Return matching subset

**`getPublicationsByIds(ids: string[])`**
- Filter static publications by ID array
- Apply hidden filter
- Return matching subset

## Graceful Degradation

All DB operations wrapped in try/catch. On DB failure:

```typescript
try {
  const { getCustomResearchers, getHiddenEntityIds } = await import("@/lib/db");
  // ... fetch custom and hidden
} catch {
  // DB unavailable: continue with static only
}
```

### Static Export Mode

When `process.env.GITHUB_ACTIONS === "true"`:
- All DB queries return empty arrays/objects
- Site renders with static JSON only
- No DB connection attempted
- Useful for building to static HTML

## Merge Strategy

### Single Entity Merge

```typescript
async function mergeOverrides<T>(entity: string, entityId: string, base: T): Promise<T> {
  // Get text overrides from DB
  const overrides = await getOverrides(entity, entityId);
  // Apply as shallow spread (overrides layer on top)
  return { ...base, ...overrides } as T;
}
```

### Batch Entity Merge

```typescript
async function batchMergeOverrides<T extends { id: string }>(entity: string, items: T[]): Promise<T[]> {
  // Fetch all overrides for all IDs in one query
  const allOverrides = await getBatchOverrides(entity, items.map(item => item.id));
  // Apply to each item
  return items.map(item => {
    const overrides = allOverrides[item.id];
    if (!overrides || Object.keys(overrides).length === 0) return item;
    return { ...item, ...overrides };
  });
}
```

## JSON Structure

### researchers.json

Array of Researcher objects:
```json
[
  {
    "id": "1",
    "name": "Lead Researcher",
    "title": "Director",
    "about": "Bio text...",
    "slug": "lead-researcher",
    "projectIds": ["1", "2"],
    "publicationIds": ["1", "5", "10"],
    "image": "https://...",
    "email": "lead@example.com",
    "linkedin": "linkedin.com/..."
  },
  ...
]
```

### projects.json

Array of Project objects:
```json
[
  {
    "id": "1",
    "name": "Early Warning System",
    "about": "Machine learning model for deterioration prediction...",
    "slug": "early-warning-system",
    "researcherIds": ["1", "2"],
    "publicationIds": ["1", "2", "3"],
    "image": "https://..."
  },
  ...
]
```

### publications.json

Array of Publication objects:
```json
[
  {
    "id": "1",
    "name": "Wearable-Based Deep Learning Model...",
    "journal": "Nature Medicine",
    "abstract": "We developed a deep learning model...",
    "slug": "wearable-deep-learning-model",
    "publicationUrl": "https://doi.org/...",
    "researcherIds": ["1", "2"],
    "projectIds": ["1"],
    "image": "https://..."
  },
  ...
]
```

## Database Tables for Overrides & Custom Content

### text_overrides

| Column | Type | Purpose |
|--------|------|---------|
| entity | text | Type: researcher, project, publication, page |
| entity_id | text | ID of the entity or page name |
| field | text | Field name to override |
| value | text | Override value |
| updated_at | timestamp | When last updated |

Primary key: `(entity, entity_id, field)`

**Use cases:**
- Override researcher name/title/about/photo/credentials
- Override project name/about
- Override publication name/journal/abstract/publicationUrl
- Override page text (home subtitle, about intro, etc.)

### hidden_entities

| Column | Type | Purpose |
|--------|------|---------|
| entity | text | Type: researcher, project, publication |
| entity_id | text | ID of static entity to hide |

**Use case:** Soft-delete static entities (move to alumni, archive)

### custom_researchers

| Column | Type | Purpose |
|--------|------|---------|
| id | text | `custom-{timestamp}` |
| name | text | Researcher name |
| title | text | Job title |
| created_at | timestamp | Creation date |

**Use case:** Admin creates new researcher

### custom_projects

| Column | Type | Purpose |
|--------|------|---------|
| id | text | `custom-{timestamp}` |
| name | text | Project name |
| about | text | Project description |
| created_at | timestamp | Creation date |

**Use case:** Admin creates new project

### custom_publications

| Column | Type | Purpose |
|--------|------|---------|
| id | text | `custom-{timestamp}` |
| name | text | Publication title |
| journal | text | Journal name |
| abstract | text | Abstract |
| publication_url | text | External link |
| created_at | timestamp | Creation date |

**Use case:** Admin adds new publication

### db_alumni

| Column | Type | Purpose |
|--------|------|---------|
| id | serial | Row ID |
| name | text | Alumni name |
| credentials | text | Credentials (PhD, MD, etc.) |
| created_at | timestamp | Creation date |

**Unique key:** `(name, credentials)`

## Deletion Semantics

| Scenario | Action | Result |
|----------|--------|--------|
| Hide static researcher | Insert hide marker in `hidden_entities` | Still in DB, filtered from queries |
| Delete custom researcher | DELETE from `custom_researchers` | Permanently removed |
| Hide static project | Insert hide marker in `hidden_entities` | Soft-delete |
| Delete custom project | DELETE from `custom_projects` | Permanent removal |
| Delete publication | If custom: DELETE; If static: insert hide marker | Varies by type |
| Move to alumni | Hide + insert into `db_alumni` | Moved to alumni section |

## Caching & ISR

### Static Generation with ISR

All pages use `export const revalidate = 60`:
- Generated on-demand first request
- Cached for 60 seconds
- After 60s, background revalidate on next request

### Revalidation on Mutation

Server Actions call `revalidatePath()` to bust cache:
```typescript
revalidatePath("/team");           // Revalidate team listing
revalidatePath("/team/[slug]");    // Revalidate all researcher profiles
revalidatePath("/");               // Revalidate homepage
```

### Batch Revalidation

Updating a publication might affect:
- `/publications` (listing)
- `/research/[slug]` (if publication is associated)
- `/team/[slug]` (if publication is associated)
- `/` (if it's featured)

Each Server Action revalidates all potentially affected paths.

## Performance Optimizations

1. **Batch override fetching:** Single query for all overrides per entity type
2. **Lazy DB imports:** DB only imported if needed (degradation support)
3. **Set-based hidden filtering:** Fast O(1) lookups with `new Set()`
4. **Static data in repo:** Always available, no DB roundtrip
5. **Custom entities minimal props:** Only required fields, overrideable later
