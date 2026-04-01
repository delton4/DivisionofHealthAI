import type { Researcher, Project, Publication } from "@/lib/types";
import researchersJson from "./researchers.json";
import projectsJson from "./projects.json";
import publicationsJson from "./publications.json";

export const researchers: Researcher[] = researchersJson as Researcher[];

// Filter out the "Website" meta-project
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
