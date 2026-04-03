# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Research division website for the Division of Health AI at Northwell Health's Feinstein Institutes for Medical Research. Showcases researchers, projects, and publications with an admin CMS for content management.

IGNORE EVERYTHING UNDER /ARCHIVE — NO READING FROM THIS FOLDER.

## Commands

All commands run from `site/`:

```bash
npm run dev          # Start dev server (Next.js 16, http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsx scripts/seed-admin.ts <username> <password>  # Create/reset admin user + seed data
npx tsx scripts/migrate.ts           # Apply pending DB migrations
npx tsx scripts/migrate.ts status    # Show migration status
npx tsx scripts/migrate.ts create <name>  # Create new migration file
```

No test framework is configured.

## Architecture

### Tech Stack
- **Next.js 16** App Router with React 19, Tailwind CSS v4, TypeScript
- **Neon Postgres** (`@neondatabase/serverless`) for dynamic content
- **Vercel Blob** for photo uploads
- **jose** for JWT sessions, **bcryptjs** for password hashing
- Deployed on **Vercel** with `@vercel/analytics` and `@vercel/speed-insights`

### Data Layer: Static JSON + DB Overrides

The core design pattern is a **hybrid static/dynamic data model**. Content lives in two places:

1. **Static JSON** (`src/data/*.json`) — baseline researchers, projects, publications. These are the source of truth for entities shipped with the codebase.
2. **Neon Postgres** — stores overrides, custom entities, hidden entities, and alumni.

The data module (`src/data/index.ts`) merges them at read time:
- `getAll*WithOverrides()` functions load static JSON, filter out `hidden_entities`, append `custom_*` DB rows, then apply `text_overrides` per field.
- `get*WithOverrides(slug)` functions do the same for single-entity lookups.
- DB operations are dynamically imported and wrapped in try/catch so the site degrades gracefully when the database is unavailable (e.g., during static export with `GITHUB_ACTIONS=true`).

### Database Tables (created by `seed-admin.ts`)
- `text_overrides` — per-field text overrides for any entity (keyed by entity/entity_id/field)
- `hidden_entities` — soft-deletes for static JSON entities
- `custom_publications`, `custom_projects`, `custom_researchers` — admin-created entities (IDs prefixed `custom-`)
- `db_alumni` — alumni managed entirely in DB
- `admin_users` — login credentials (username stored in `email` column)

### Admin System
- Login at `/admin/login`, session via JWT cookie (`session`) + client-side hint cookie (`admin_logged_in`)
- `AdminProvider` (React context) reads the hint cookie in the root layout to toggle admin UI throughout the app
- `EditableText` component enables inline editing on public pages when admin is logged in
- Admin pages at `/admin/team`, `/admin/research`, `/admin/publications` for CRUD operations
- All mutations go through Server Actions in `src/lib/actions.ts`, each gated by `verifySession()`
- Photo uploads go to Vercel Blob, URL stored as a text override on the researcher

### Routing
- `/` — homepage with featured research, paper highlight, publications
- `/team` and `/team/[slug]` — team listing and individual researcher profiles
- `/research` and `/research/[slug]` — project listing and detail
- `/publications` — filterable publications list
- `/about`, `/join` — static-ish pages (support DB text overrides)
- `/admin/*` — admin CMS pages

### Styling
- Dark theme only. Custom color tokens defined in `globals.css` via Tailwind v4 `@theme inline`
- Fonts: Instrument Serif (display/headings), Inter (body)
- CSS animations for hero text reveal and section fade-ins
- Pages use `revalidate = 60` for ISR

### Key Conventions
- Path alias: `@/*` maps to `./src/*`
- Entity IDs from static JSON are numeric strings; custom entities use `custom-{timestamp}` IDs
- Deletion of static entities = hiding (DB flag); deletion of custom entities = actual DB row removal
- All DB access is in `src/lib/db.ts` (server-only), all mutations in `src/lib/actions.ts` (server actions)
