# Northwell Health - Division of Health AI Website

## Project Overview
Research division website for the Division of Health AI at Northwell Health's Feinstein Institutes for Medical Research. Showcases researchers, projects, and publications.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Content:** MDX files
- **Hosting:** Vercel
- **Design:** Bold & immersive — dark backgrounds, strong colors, hero animations, AI lab aesthetic

## Project Structure
- `site/` — New Next.js application (active development)
- `archive/` — Previous static site build (Python/Jinja2). **DO NOT modify or reference files in this folder.** It exists only as a data reference for migrating content.

## Content
The site presents:
- **Researchers** — Team members with bios, photos, LinkedIn links
- **Projects** — Active research initiatives
- **Publications** — Published papers and findings
- **About** — Division mission, values, leadership
- **Join Us** — Recruiting visiting scholars and research collaborators

## Key Data Reference
Content data from the previous site lives in `archive/data/` as JSON files and `archive/DataForSite.xlsx`. Use these as reference when building MDX content — do not integrate the Excel pipeline into the new site.
