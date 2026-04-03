# Architecture Codemaps — Northwell Health AI Research Site

This directory contains detailed architectural documentation of the Northwell Health research division website. These codemaps are machine-generated from the codebase structure and are kept in sync with actual implementation.

**Last Updated:** 2026-04-03  
**Project:** Division of Health AI at Northwell Health's Feinstein Institutes for Medical Research

## Quick Navigation

| Document | Purpose | Audience |
|----------|---------|----------|
| **[INDEX.md](./INDEX.md)** | Overview of all codemaps, tech stack, key conventions | Everyone |
| **[frontend.md](./frontend.md)** | Page routing, components, client/server boundaries | Frontend engineers, full-stack |
| **[backend.md](./backend.md)** | Server Actions, sessions, mutations, authentication | Backend engineers, full-stack |
| **[data.md](./data.md)** | Data layer, static JSON + DB merging, merge strategy | Data engineers, backend |
| **[admin.md](./admin.md)** | CMS system, CRUD operations, content management UI | Full-stack, product |
| **[database.md](./database.md)** | Schema, migrations, tables, SQL queries | Backend, DevOps |

## Architecture at a Glance

### Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 (dark theme)
- **Database:** Neon Postgres (serverless)
- **Storage:** Vercel Blob (photo uploads)
- **Auth:** JWT (jose) + bcryptjs
- **Deploy:** Vercel

### Core Design: Hybrid Static + Dynamic

```
Public sees content from two sources:
1. Static JSON in git repo (researchers.json, projects.json, publications.json)
2. Postgres DB with overrides & custom entities

Data layer merges them at request time:
  JSON data → Apply hidden markers → Add custom entities → Apply text overrides → Render
```

### Key Paths

```
Frontend Routes:
  /                          — Homepage (featured research, publications)
  /team, /team/[slug]       — Researchers
  /research, /research/[slug] — Projects
  /publications              — Publications list
  /about, /join              — Static pages
  /admin/login               — Login page
  /admin/team|research|publications — CMS pages

Source Code:
  /src/app                   — Page routes
  /src/components            — React components
  /src/lib/actions.ts        — Server Actions (mutations)
  /src/lib/db.ts             — Database queries
  /src/data/index.ts         — Data merging layer
  /src/data/*.json           — Static content
  /src/lib/session.ts        — JWT session handling
  /src/lib/types.ts          — TypeScript interfaces
```

## How to Use These Codemaps

### For Adding a New Page

1. Read **[INDEX.md](./INDEX.md)** — Understand conventions
2. Read **[frontend.md](./frontend.md)** — See page structure examples
3. Read **[data.md](./data.md)** — Understand data fetching pattern
4. Create `/src/app/[path]/page.tsx` following the pattern

### For Adding a Database Feature

1. Read **[database.md](./database.md)** — Understand schema
2. Read **[backend.md](./backend.md)** — Understand Server Actions
3. Add table via migration: `npx tsx scripts/migrate.ts create migration_name`
4. Add query functions to `/src/lib/db.ts`
5. Add Server Actions to `/src/lib/actions.ts`

### For Editing Admin CMS

1. Read **[admin.md](./admin.md)** — Understand CMS architecture
2. Read **[backend.md](./backend.md)** — Understand Server Actions
3. Update manager component in `/src/app/admin/[entity]/`
4. Update validation in `src/lib/actions.ts`

### For Debugging Data Issues

1. Read **[data.md](./data.md)** — Understand merge strategy
2. Read **[database.md](./database.md)** — Check schema
3. Check if entity is hidden in `hidden_entities` table
4. Check if override exists in `text_overrides` table
5. Check if custom entity exists in `custom_*` table

### For Performance Optimization

1. Read **[backend.md](./backend.md)** — Understand rate limiting
2. Read **[data.md](./data.md)** — Understand caching strategy
3. Read **[database.md](./database.md)** — Check indexes and N+1 issues

## Key Concepts

### Static vs Custom Entities

| Aspect | Static | Custom |
|--------|--------|--------|
| Storage | `src/data/*.json` | Postgres tables |
| ID Format | Numeric string ("1", "5") | `custom-{timestamp}` |
| Deletion | Soft-delete (hide marker) | Hard-delete (row removal) |
| Editing | Text overrides only | Text overrides |
| Created by | Developers (in git) | Admin (CMS) |
| Backup | Git history | Postgres backup |

### Text Overrides

Any field in any entity can be overridden at runtime:

```
Database row:
  entity='researcher', entity_id='1', field='name', value='Dr. Jane Smith'

When fetching researcher "1":
  Static JSON has name="Jane Researcher"
  Override applied: name="Dr. Jane Smith"
  User sees: "Dr. Jane Smith"
```

**No schema changes needed** — just insert a row in `text_overrides`.

### Graceful Degradation

If database unavailable (network error, cold start):
1. Try to fetch from DB (try/catch)
2. If DB fails, use static JSON only
3. Site still renders, just without overrides
4. Useful for static exports

### ISR (Incremental Static Regeneration)

```
First request → Generate page from static + DB → Cache for 60 seconds
Admin edits text → revalidatePath() → Clear cache → Next request regenerates
```

## Database Tables

| Table | Purpose | Rows | Notes |
|-------|---------|------|-------|
| `admin_users` | Login credentials | ~1 | Created by seed-admin.ts |
| `text_overrides` | Field overrides | 0-1000s | Growing with edits |
| `hidden_entities` | Soft-delete markers | 0-100s | Filtering happens here |
| `custom_researchers` | Admin-created researchers | 0-100s | Hard-delete on remove |
| `custom_projects` | Admin-created projects | 0-100s | Hard-delete on remove |
| `custom_publications` | Admin-created publications | 0-1000s | Hard-delete on remove |
| `db_alumni` | Alumni records | 0-100s | Hard-delete on remove |

See **[database.md](./database.md)** for detailed schema.

## Common Workflows

### Edit a Researcher's Bio

1. Log in at `/admin/login`
2. Go to `/admin/team`
3. Click pencil icon on researcher name
4. Edit and save
5. Text override created in DB
6. Page revalidated, user sees new text in <60 seconds

### Add a New Publication

1. Log in at `/admin/login`
2. Go to `/admin/publications`
3. Fill form (title, journal, abstract, URL)
4. Submit
5. New row in `custom_publications` table
6. ID generated: `custom-{timestamp}`
7. Appears on `/publications` and homepage within 60 seconds

### Move Researcher to Alumni

1. Log in at `/admin/login`
2. Go to `/admin/team`
3. Click "Move to alumni" on researcher
4. Enter credentials (PhD, MD, etc.)
5. Two things happen:
   - Researcher hidden from `/team` page
   - Alumni record created in `db_alumni`
6. Alumni appears on `/team` page in separate section

### Hide a Project Temporarily

1. Log in at `/admin/login`
2. Go to `/admin/research`
3. Click "Hide" on project
4. Insert marker in `hidden_entities` table
5. Project filtered from queries
6. Project can be restored later with "Restore" button

## Authentication & Security

- **Login:** Username + password (form at `/admin/login`)
- **Session:** JWT cookie (httpOnly, Secure in production)
- **Verification:** All mutations require `verifySession()`
- **Rate limiting:** 5 login attempts per 15 minutes per IP
- **Passwords:** Hashed with bcryptjs (no plaintext)
- **Photo URLs:** Public (anyone can view), stored as text override

See **[backend.md](./backend.md)** for authentication details.

## Deployment

Deployed on **Vercel** with:
- Automatic builds from git
- Serverless functions for Server Actions
- Edge functions for middleware (optional)
- Blob storage for photos
- Analytics + Speed Insights

Environment variables required:
```
DATABASE_URL      # Neon Postgres connection string
SESSION_SECRET    # 32+ character secret for JWT
BLOB_READ_WRITE_TOKEN  # Vercel Blob auth
```

## Development Commands

From `site/` directory:

```bash
npm run dev                                    # Start dev server (http://localhost:3000)
npm run build                                  # Production build
npm run lint                                   # Run ESLint
npx tsx scripts/seed-admin.ts <user> <pass>   # Create/reset admin + seed data
npx tsx scripts/migrate.ts                     # Apply DB migrations
npx tsx scripts/migrate.ts status              # Check migration status
npx tsx scripts/migrate.ts create <name>       # Create new migration
```

## File Organization Summary

```
site/
├── src/
│   ├── app/                 — Next.js App Router pages
│   │   ├── page.tsx         — Homepage
│   │   ├── team/            — Researcher pages
│   │   ├── research/        — Project pages
│   │   ├── publications/    — Publication list
│   │   ├── admin/           — CMS pages (auth required)
│   │   ├── about/, join/    — Static pages
│   │   ├── layout.tsx       — Root layout
│   │   └── error.tsx        — Error boundary
│   ├── components/          — Reusable components
│   │   ├── EditableText.tsx — Inline editing for admins
│   │   ├── *Card.tsx        — Display components
│   │   ├── *Manager.tsx     — CRUD UI for admins
│   │   └── ...
│   ├── lib/
│   │   ├── actions.ts       — Server Actions (mutations)
│   │   ├── db.ts            — Database queries (server-only)
│   │   ├── session.ts       — JWT session handling
│   │   └── types.ts         — TypeScript interfaces
│   ├── data/
│   │   ├── index.ts         — Data access layer
│   │   ├── researchers.json — Static content
│   │   ├── projects.json
│   │   └── publications.json
│   ├── hooks/               — Custom React hooks
│   └── proxy.ts             — Middleware setup
├── public/                  — Static assets
├── migrations/              — Database migrations
├── scripts/
│   ├── seed-admin.ts        — Initialize admin + schema
│   └── migrate.ts           — Run migrations
├── package.json             — Dependencies
├── tsconfig.json            — TypeScript config
├── next.config.js           — Next.js config
└── tailwind.config.js       — Tailwind CSS config
```

## Troubleshooting

### Page shows old content after edit

- ISR caches for 60 seconds
- Click back button or wait ~1 minute
- Or manually revalidate in next admin action
- Check `revalidatePath()` calls in Server Actions

### Photo doesn't upload

- Check file type (must be JPEG, PNG, WebP, GIF)
- Check file size (<5 MB)
- Check Vercel Blob token in env
- Check browser network tab for upload error

### Database queries fail

- Check `DATABASE_URL` in env
- Check Neon connection limits
- Check migration status: `npx tsx scripts/migrate.ts status`
- Check DB is not in sleep mode (Neon scales to zero)

### Login not working

- Check `SESSION_SECRET` is set (32+ chars)
- Check admin user exists: `SELECT * FROM admin_users;`
- Check password hash: `npx tsx scripts/seed-admin.ts username newpassword`
- Check cookie settings in Chrome DevTools

### Admin UI not appearing

- Check admin logged in (look for `admin_logged_in` cookie)
- Check `AdminProvider` wrapping root layout
- Check browser console for errors
- Session may have expired

## Contributing

When making changes:

1. **Update source code** in appropriate directory
2. **Update this codemap** if architecture changes
3. **Verify file paths** still exist
4. **Test** changes locally before committing
5. **Include migration** if DB schema changes

## References

- **CLAUDE.md** — Full project guide, setup commands, conventions
- **src/CLAUDE.md** — Site-specific instructions
- **.claude/rules/** — Project coding rules and patterns
- **package.json** — Dependencies and versions
- **Next.js docs** — https://nextjs.org/docs
- **Neon docs** — https://neon.tech/docs

## Questions?

Refer to the specific codemap for your question:

- "How do I add a page?" → **[frontend.md](./frontend.md)**
- "How does authentication work?" → **[backend.md](./backend.md)**
- "How does data merge?" → **[data.md](./data.md)**
- "How do I add a form?" → **[admin.md](./admin.md)**
- "What's the schema?" → **[database.md](./database.md)**
- "What's the tech stack?" → **[INDEX.md](./INDEX.md)**

---

**Generated:** 2026-04-03  
**Tool:** Claude Code (Codemap Generator)  
**Source:** Live codebase analysis
