# Frontend Codemap

**Last Updated:** 2026-04-03  
**Entry Points:** `/src/app/layout.tsx` (root), `/src/app/page.tsx` (homepage)

## Architecture

```
layout.tsx (Server Component, provides AdminProvider)
├── Navigation (always visible)
├── Page Routes
│   ├── / (HomePage)
│   ├── /team (TeamPage)
│   ├── /team/[slug] (ResearcherDetail)
│   ├── /research (ResearchPage)
│   ├── /research/[slug] (ProjectDetail)
│   ├── /publications (PublicationsPage)
│   ├── /about, /join (StaticPages)
│   └── /admin/* (Admin CMS routes)
├── EditableText (inline edit mode for admins)
└── Footer
```

## Pages & Routes

| Route | File | Purpose | Component Pattern |
|-------|------|---------|-------------------|
| `/` | `app/page.tsx` | Featured research, pub highlight, calls-to-action | Server Component, 4 sections |
| `/team` | `app/team/page.tsx` | All researchers + alumni section | Query `getAllResearchersWithOverrides()` |
| `/team/[slug]` | `app/team/[slug]/page.tsx` | Individual researcher profile with projects/pubs | Query by slug, `getResearcherWithOverrides()` |
| `/research` | `app/research/page.tsx` | All projects in grid | Query `getAllProjectsWithOverrides()` |
| `/research/[slug]` | `app/research/[slug]/page.tsx` | Project detail with researchers/pubs | Query by slug, `getProjectWithOverrides()` |
| `/publications` | `app/publications/page.tsx` | Filterable publication list | Client-side filter (useSearchParams) |
| `/about` | `app/about/page.tsx` | About page (text overridable) | `getPageOverrides("about")` |
| `/join` | `app/join/page.tsx` | Join/collaborate page (text overridable) | `getPageOverrides("join")` |
| `/admin/login` | `app/admin/login/page.tsx` | Login form | Action `login()` |
| `/admin/team` | `app/admin/team/page.tsx` | Manage researchers (add/hide/edit) | `TeamManager` component |
| `/admin/research` | `app/admin/research/page.tsx` | Manage projects (add/hide/edit) | `ProjectManager` component |
| `/admin/publications` | `app/admin/publications/page.tsx` | Manage publications (add/hide/edit) | `PublicationManager` component |

## Key Components

### Layout & UI

| Component | File | Purpose |
|-----------|------|---------|
| Root Layout | `layout.tsx` | Wraps app in AdminProvider, renders Navigation, Footer |
| Navigation | `Navigation.tsx` | Header with logo, nav links, admin login/logout button |
| Footer | `Footer.tsx` | Footer with links and company info |
| HeroLogo | `HeroLogo.tsx` | Animated SVG logo (display on desktop homepage) |
| LogoMark | `LogoMark.tsx` | Logo mark for favicon/branding |
| AccentLine | `AccentLine.tsx` | Decorative animated line (appears after hero text) |
| AnimatedSection | `AnimatedSection.tsx` | Fade-in animation on scroll view |

### Content Cards

| Component | File | Purpose |
|-----------|------|---------|
| TeamCard | `TeamCard.tsx` | Researcher preview card (name, title, link) |
| ProjectCard | `ProjectCard.tsx` | Project preview card (name, link) |
| PublicationCard | `PublicationCard.tsx` | Publication preview (name, journal, link) |

### Admin & Editing

| Component | File | Purpose |
|-----------|------|---------|
| AdminProvider | `AdminProvider.tsx` | React context providing `adminLoggedIn` flag from hint cookie |
| EditableText | `EditableText.tsx` | Conditionally inline-editable text for admins |
| PhotoUpload | `PhotoUpload.tsx` | File picker + upload handler for researcher photos |
| TeamManager | `admin/team/TeamManager.tsx` | CRUD UI for researchers |
| ProjectManager | `admin/research/ProjectManager.tsx` | CRUD UI for projects |
| PublicationManager | `admin/publications/PublicationManager.tsx` | CRUD UI for publications |

## Data Flow

### Static Pages (Server Components)

1. **Request:** User navigates to `/team`
2. **Server:** `TeamPage` calls `getAllResearchersWithOverrides()`
   - Loads `researchers.json` (static)
   - Fetches `getCustomResearchers()` from DB (try/catch)
   - Fetches `getHiddenEntityIds("researcher")` from DB
   - Filters hidden IDs, merges custom rows
3. **Render:** Server component renders team cards with merged data
4. **Cache:** ISR at 60 seconds (`export const revalidate = 60`)

### Interactive Features (Client-side)

1. **Publications filter:** `PublicationCard` uses `useSearchParams()` hook
   - Suspense boundary required (CSR bailout)
   - URL params drive filter state
   - No server roundtrip needed

### Admin Editing (Server Action + Revalidation)

1. **Click edit** on `EditableText` (visible only if admin logged in)
2. **Form submit** to `saveTextOverride()` server action
3. **Verify session** → validate entity/field → save to DB
4. **Revalidate paths** affected by the override
5. **Client updates** when response returns

## Styling System

- **Framework:** Tailwind CSS v4 with `@theme` inline
- **Theme:** Dark theme only
- **Custom tokens:** `globals.css` defines color variables (foreground, text-secondary, border, etc.)
- **Fonts:** Instrument Serif (display), Inter (body)
- **Animations:** `line-reveal`, `fade-in-section` via CSS keyframes

## Client/Server Boundary

### Server Components (Default)

- Page routes (all `page.tsx` files)
- Card components (render from props)
- Root Layout (wraps entire app)

### Client Components

- `Navigation` — uses hooks, sidebar toggle
- `EditableText` — state for edit mode, form handling
- `PublicationFilter` — `useSearchParams()` for URL-driven filter
- `PhotoUpload` — file input, progress handling
- `AdminProvider` — React Context API

### No "use client" Needed For

- Server Actions in `actions.ts` — called from form/buttons
- Dynamic imports of DB queries — wrapped in try/catch at read time

## ISR & Caching

- All content pages use `export const revalidate = 60` (60 seconds)
- On-demand revalidation with `revalidatePath()` in Server Actions
- Graceful fallback: if DB unavailable, renders static JSON

## Error Handling

- `error.tsx` — catches errors in page tree, shows fallback UI
- `not-found.tsx` — renders 404 for missing routes
- `loading.tsx` — optional loading skeleton
- DB errors in data layer — caught and return empty/default

## Metadata & SEO

- Each page exports `Metadata` object with `title`
- Root layout sets up base metadata
- Researcher/project/publication detail pages set dynamic titles
