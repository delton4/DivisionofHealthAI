# Northwell Health AI Site — Architecture Codemaps

**Last Updated:** 2026-04-03  
**Project:** Research division website for Division of Health AI at Northwell Health's Feinstein Institutes for Medical Research  
**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS v4 + Neon Postgres + Vercel

## Overview

This project showcases researchers, projects, and publications with an admin CMS for content management. The architecture uses a **hybrid static/dynamic data model** where baseline content lives in JSON files and Postgres stores overrides, custom entities, and administrative data.

## Codemaps

| Codemap | Purpose | Key Files |
|---------|---------|-----------|
| **[frontend.md](./frontend.md)** | Page routing, components, client/server boundaries | `/src/app`, `/src/components` |
| **[backend.md](./backend.md)** | Server Actions, sessions, authentication | `/src/lib/actions.ts`, `/src/lib/session.ts` |
| **[data.md](./data.md)** | Data layer, static JSON + DB merging | `/src/data`, `/src/lib/db.ts` |
| **[admin.md](./admin.md)** | CMS system, CRUD operations, access control | `/src/app/admin`, manager components |
| **[database.md](./database.md)** | Schema, migrations, tables | Database tables and relationships |

## Technology Decisions

### Data Model: Static + DB Overrides

The site uses a novel hybrid approach:

1. **Static JSON** (`/src/data/*.json`) — base researchers, projects, publications
2. **Postgres overrides** — text field overrides, soft-deletes (hidden_entities), custom entities
3. **Graceful degradation** — site renders with static data alone if DB unavailable

This design allows:
- Shipping content in the repository
- Admin ability to override any field without DB schema changes
- Album/custom entity support entirely in DB
- ISR at 60s with efficient override fetching

### Authentication & Sessions

- JWT cookies via **jose** library
- Passwords hashed with **bcryptjs**
- Rate-limited login (5 attempts / 15 min)
- Server-side session verification on all mutations
- Client-side hint cookie for admin UI toggle

### Photo Storage

- Uploaded to **Vercel Blob** (public URLs)
- Stored as text override on researcher entity
- Automatic filename with timestamp to prevent collisions

## Key Conventions

| Convention | Rule | Example |
|-----------|------|---------|
| **Entity IDs** | Static = numeric string; Custom = `custom-{timestamp}` | `"1"` vs `"custom-1712102400000"` |
| **Deletion** | Static entities hidden; Custom entities deleted | Hide with DB flag vs remove row |
| **Slugs** | URL-friendly identifier for routing | `researcher.slug` used in `/team/[slug]` |
| **Path alias** | `@/*` maps to `./src/*` | `@/components`, `@/lib/db` |
| **ISR cadence** | 60-second revalidation | `export const revalidate = 60` |
| **Admin gating** | All mutations require `verifySession()` | In `src/lib/actions.ts` |

## Database Tables

Created automatically by `npm run seed-admin.ts`:

- `admin_users` — login credentials (username in `email` column)
- `text_overrides` — per-field overrides for any entity
- `hidden_entities` — soft-delete markers for static entities
- `custom_researchers`, `custom_projects`, `custom_publications` — admin-created entities
- `db_alumni` — alumni tracked entirely in DB

## File Organization

```
site/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── team/              # Team listing & researcher detail
│   │   ├── research/          # Project listing & detail
│   │   ├── publications/      # Publication list with filters
│   │   ├── admin/             # CMS pages (auth required)
│   │   ├── about/, join/      # Static pages (text overridable)
│   │   └── layout.tsx         # Root layout with AdminProvider
│   ├── components/             # Reusable React components
│   │   ├── EditableText.tsx    # Inline edit + save for admins
│   │   ├── *Card.tsx           # Entity display cards
│   │   ├── *Manager.tsx        # CRUD UI for admins
│   │   └── ...
│   ├── lib/
│   │   ├── actions.ts          # Server Actions (mutations)
│   │   ├── db.ts               # Database queries (server-only)
│   │   ├── session.ts          # JWT session handling
│   │   └── types.ts            # TypeScript interfaces
│   ├── data/
│   │   ├── index.ts            # Data access layer (static + overrides)
│   │   ├── researchers.json    # Base researcher data
│   │   ├── projects.json       # Base project data
│   │   └── publications.json   # Base publication data
│   └── hooks/                  # Custom React hooks
└── public/                     # Static assets

```

## Related Documentation

- `CLAUDE.md` — Full architecture guide and setup commands
- `.claude/rules/` — Project-specific coding patterns and conventions
