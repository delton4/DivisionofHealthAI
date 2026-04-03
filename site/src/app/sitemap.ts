import type { MetadataRoute } from "next";
import { researchers, projects } from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://divhealthai.org";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/team`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/research`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/publications`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/join`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const researcherPages: MetadataRoute.Sitemap = researchers
    .filter((r) => !r.alumni)
    .map((r) => ({
      url: `${baseUrl}/team/${r.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/research/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...researcherPages, ...projectPages];
}
