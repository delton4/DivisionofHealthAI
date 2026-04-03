import type { Researcher, Project, Publication, Alumni } from "@/lib/types";
import researchersJson from "./researchers.json";
import projectsJson from "./projects.json";
import publicationsJson from "./publications.json";

// ---- Static data ----
// All entries are included here. Visibility filtering (alumni, hidden)
// is handled by the async getAll*WithOverrides() functions via the
// hidden_entities DB table.

export const researchers: Researcher[] = researchersJson as Researcher[];

export const projects: Project[] = projectsJson as Project[];

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
  let allResearchers = [...researchers];

  try {
    const { getCustomResearchers, getHiddenEntityIds } = await import("@/lib/db");
    const [customRows, hiddenIds] = await Promise.all([
      getCustomResearchers(),
      getHiddenEntityIds("researcher"),
    ]);

    allResearchers = allResearchers.filter((r) => !hiddenIds.has(r.id));

    for (const row of customRows) {
      allResearchers.push({
        id: row.id,
        name: row.name,
        title: row.title,
        about: "",
        slug: row.id,
        projectIds: [],
        publicationIds: [],
        image: "",
      });
    }
  } catch {
    // DB unavailable
  }

  return Promise.all(
    allResearchers.map((r) => mergeOverrides("researcher", r.id, r))
  );
}

export async function getAllProjectsWithOverrides(): Promise<Project[]> {
  let allProjects = [...projects];

  try {
    const { getCustomProjects, getHiddenEntityIds } = await import("@/lib/db");
    const [customRows, hiddenIds] = await Promise.all([
      getCustomProjects(),
      getHiddenEntityIds("project"),
    ]);

    allProjects = allProjects.filter((p) => !hiddenIds.has(p.id));

    for (const row of customRows) {
      allProjects.push({
        id: row.id,
        name: row.name,
        title: "",
        about: row.about,
        slug: row.id,
        researcherIds: [],
        publicationIds: [],
        image: "",
      });
    }
  } catch {
    // DB unavailable
  }

  return Promise.all(
    allProjects.map((p) => mergeOverrides("project", p.id, p))
  );
}

export async function getAllAlumni(): Promise<Alumni[]> {
  try {
    const { getDbAlumni } = await import("@/lib/db");
    const dbRows = await getDbAlumni();
    return (dbRows as { name: string; credentials: string }[]).map((row) => ({
      name: row.name,
      credentials: row.credentials,
    }));
  } catch {
    return [];
  }
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
