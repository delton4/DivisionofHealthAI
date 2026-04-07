import type { Researcher, Project, Publication, Alumni } from "@/lib/types";
import researchersJson from "./researchers.json";
import projectsJson from "./projects.json";
import publicationsJson from "./publications.json";
import alumniJson from "./alumni.json";

// ---- Static data ----
// All entries are included here. Visibility filtering (alumni, hidden)
// is handled by the async getAll*WithOverrides() functions via the
// hidden_entities DB table.

export const researchers: Researcher[] = researchersJson as Researcher[];

export const projects: Project[] = projectsJson as Project[];

export const publications: Publication[] = publicationsJson as Publication[];

function getResearcher(slug: string): Researcher | undefined {
  return researchers.find((r) => r.slug === slug);
}

function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

async function getHidden(entity: string): Promise<Set<string>> {
  if (process.env.GITHUB_ACTIONS === "true") return new Set();
  try {
    const { getHiddenEntityIds } = await import("@/lib/db");
    return getHiddenEntityIds(entity);
  } catch {
    return new Set();
  }
}

export async function getResearchersByIds(ids: string[]): Promise<Researcher[]> {
  const hiddenIds = await getHidden("researcher");
  return researchers.filter((r) => ids.includes(r.id) && !hiddenIds.has(r.id));
}

export async function getProjectsByIds(ids: string[]): Promise<Project[]> {
  const hiddenIds = await getHidden("project");
  return projects.filter((p) => ids.includes(p.id) && !hiddenIds.has(p.id));
}

export async function getPublicationsByIds(ids: string[]): Promise<Publication[]> {
  const hiddenIds = await getHidden("publication");
  return publications.filter((p) => ids.includes(p.id) && !hiddenIds.has(p.id));
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

async function batchMergeOverrides<T extends { id: string }>(
  entity: string,
  items: T[]
): Promise<T[]> {
  if (process.env.GITHUB_ACTIONS === "true") return items;
  if (items.length === 0) return items;

  try {
    const { getBatchOverrides } = await import("@/lib/db");
    const allOverrides = await getBatchOverrides(
      entity,
      items.map((item) => item.id)
    );
    return items.map((item) => {
      const overrides = allOverrides[item.id];
      if (!overrides || Object.keys(overrides).length === 0) return item;
      return { ...item, ...overrides };
    });
  } catch {
    return items;
  }
}

export async function getResearcherWithOverrides(
  slug: string
): Promise<Researcher | undefined> {
  const r = getResearcher(slug);
  if (!r) return undefined;
  const hiddenIds = await getHidden("researcher");
  if (hiddenIds.has(r.id)) return undefined;
  return mergeOverrides("researcher", r.id, r);
}

export async function getProjectWithOverrides(
  slug: string
): Promise<Project | undefined> {
  const p = getProject(slug);
  if (!p) return undefined;
  const hiddenIds = await getHidden("project");
  if (hiddenIds.has(p.id)) return undefined;
  return mergeOverrides("project", p.id, p);
}

export async function getAllResearchersWithOverrides(): Promise<Researcher[]> {
  let allResearchers = researchers.filter((r) => !r.alumni);

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

  return batchMergeOverrides("researcher", allResearchers);
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

  return batchMergeOverrides("project", allProjects);
}

export async function getAllAlumni(): Promise<Alumni[]> {
  const staticAlumni: Alumni[] = alumniJson as Alumni[];

  try {
    const { getDbAlumni } = await import("@/lib/db");
    const dbRows = await getDbAlumni();
    const dbAlumni = dbRows.map((row) => ({
      name: row.name,
      credentials: row.credentials,
    }));
    return [...staticAlumni, ...dbAlumni];
  } catch {
    return staticAlumni;
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

  return batchMergeOverrides("publication", allPubs);
}

// ---- Association override helpers ----

function getEffectiveIds(
  staticIds: string[],
  additions: Set<string>,
  removals: Set<string>
): string[] {
  const filtered = staticIds.filter((id) => !removals.has(id));
  const added = [...additions].filter((id) => !filtered.includes(id));
  return [...filtered, ...added];
}

export async function getResearcherAssociations(
  researcherId: string,
  staticPubIds: string[],
  staticProjIds: string[]
): Promise<{ publicationIds: string[]; projectIds: string[] }> {
  if (process.env.GITHUB_ACTIONS === "true")
    return { publicationIds: staticPubIds, projectIds: staticProjIds };
  try {
    const { getAssociationOverrides } = await import("@/lib/db");
    const [pubOverrides, projOverrides] = await Promise.all([
      getAssociationOverrides(researcherId, "publication"),
      getAssociationOverrides(researcherId, "project"),
    ]);
    return {
      publicationIds: getEffectiveIds(staticPubIds, pubOverrides.additions, pubOverrides.removals),
      projectIds: getEffectiveIds(staticProjIds, projOverrides.additions, projOverrides.removals),
    };
  } catch {
    return { publicationIds: staticPubIds, projectIds: staticProjIds };
  }
}

export async function getResearchersForProject(
  projectId: string,
  staticResearcherIds: string[]
): Promise<Researcher[]> {
  let effectiveIds = staticResearcherIds;
  if (process.env.GITHUB_ACTIONS !== "true") {
    try {
      const { getAssociationOverridesByEntity } = await import("@/lib/db");
      const overrides = await getAssociationOverridesByEntity("project", projectId);
      effectiveIds = getEffectiveIds(staticResearcherIds, overrides.additions, overrides.removals);
    } catch {
      // DB unavailable, use static
    }
  }
  const hiddenIds = await getHidden("researcher");
  return researchers.filter((r) => effectiveIds.includes(r.id) && !hiddenIds.has(r.id));
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
