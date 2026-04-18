import type { MetadataRoute } from "next";
import {
  getAllResearchersWithOverrides,
  getAllProjectsWithOverrides,
} from "@/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://divhealthai.org";
  const now = new Date();

  const [allResearchers, allProjects] = await Promise.all([
    getAllResearchersWithOverrides(),
    getAllProjectsWithOverrides(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/team`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/publications`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const researcherPages: MetadataRoute.Sitemap = allResearchers.map((r) => ({
    url: `${baseUrl}/team/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = allProjects.map((p) => ({
    url: `${baseUrl}/research/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...researcherPages, ...projectPages];
}
