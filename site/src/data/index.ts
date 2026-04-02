import type { Researcher, Project, Publication, Alumni } from "@/lib/types";
import researchersJson from "./researchers.json";
import projectsJson from "./projects.json";
import publicationsJson from "./publications.json";

// ---- Alumni (removed from active team, listed separately) ----
const removedIds = new Set(["17", "18", "21", "22"]); // Hardik=17, Viktor=18, Avantika=21, Fylaktis=22

export const alumni: Alumni[] = [
  { name: "Avantika Vardhan", credentials: "PhD" },
  { name: "Fylaktis Fylaktou", credentials: "PhD" },
  { name: "Hardik Patel", credentials: "DO" },
  { name: "Viktor Toth", credentials: "MS" },
  { name: "Sia Bolourani", credentials: "MD PhD" },
  { name: "Subash Padmanaban", credentials: "PhD" },
];

// ---- Static data (unchanged, always available) ----

export const researchers: Researcher[] = (researchersJson as Researcher[]).filter(
  (r) => !removedIds.has(r.id)
);

export const projects: Project[] = (projectsJson as Project[]).filter(
  (p) => p.id !== "6"
);

export const publications: Publication[] = publicationsJson as Publication[];

export function getResearcher(slug: string): Researcher | undefined {
  return researchers.find((r) => r.slug === slug);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getPublication(slug: string): Publication | undefined {
  return publications.find((p) => p.slug === slug);
}

export function getResearchersByIds(ids: string[]): Researcher[] {
  return researchers.filter((r) => ids.includes(r.id));
}

export function getProjectsByIds(ids: string[]): Project[] {
  return projects.filter((p) => ids.includes(p.id));
}

export function getPublicationsByIds(ids: string[]): Publication[] {
  return publications.filter((p) => ids.includes(p.id));
}

// ---- Override-aware async functions (merge static + database) ----

async function mergeOverrides<T>(
  entity: string,
  entityId: string,
  base: T
): Promise<T> {
  // Skip DB in static export mode
  if (process.env.GITHUB_ACTIONS === "true") return base;

  try {
    const { getOverrides } = await import("@/lib/db");
    const overrides = await getOverrides(entity, entityId);
    if (Object.keys(overrides).length === 0) return base;
    return { ...base, ...overrides } as T;
  } catch {
    return base;
  }
}

export async function getResearcherWithOverrides(
  slug: string
): Promise<Researcher | undefined> {
  const r = getResearcher(slug);
  if (!r) return undefined;
  return mergeOverrides("researcher", r.id, r);
}

export async function getProjectWithOverrides(
  slug: string
): Promise<Project | undefined> {
  const p = getProject(slug);
  if (!p) return undefined;
  return mergeOverrides("project", p.id, p);
}

export async function getAllResearchersWithOverrides(): Promise<Researcher[]> {
  return Promise.all(
    researchers.map((r) => mergeOverrides("researcher", r.id, r))
  );
}

export async function getAllProjectsWithOverrides(): Promise<Project[]> {
  return Promise.all(
    projects.map((p) => mergeOverrides("project", p.id, p))
  );
}

export async function getAllPublicationsWithOverrides(): Promise<Publication[]> {
  // Merge custom pubs from database + filter hidden ones
  let allPubs = [...publications];

  try {
    const { getCustomPublications, getHiddenEntityIds } = await import("@/lib/db");
    const [customRows, hiddenIds] = await Promise.all([
      getCustomPublications(),
      getHiddenEntityIds("publication"),
    ]);

    // Filter out hidden static pubs
    allPubs = allPubs.filter((p) => !hiddenIds.has(p.id));

    // Add custom pubs from database
    for (const row of customRows) {
      allPubs.unshift({
        id: row.id,
        name: row.name,
        journal: row.journal,
        abstract: row.abstract,
        slug: row.id,
        publicationUrl: row.publication_url,
        researcherIds: [],
        projectIds: [],
        image: "",
      });
    }
  } catch {
    // DB unavailable, use static only
  }

  return Promise.all(
    allPubs.map((p) => mergeOverrides("publication", p.id, p))
  );
}

export async function getPageOverrides(
  pageId: string
): Promise<Record<string, string>> {
  if (process.env.GITHUB_ACTIONS === "true") return {};
  try {
    const { getOverrides } = await import("@/lib/db");
    return getOverrides("page", pageId);
  } catch {
    return {};
  }
}
