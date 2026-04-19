import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { MonoTag } from "@/components/MonoTag";
import {
  getAllProjectsWithOverrides,
  getProjectWithOverrides,
  getResearchersForProject,
  getPublicationsByIds,
} from "@/data";

export const revalidate = 60;

export async function generateStaticParams() {
  const visible = await getAllProjectsWithOverrides();
  return visible.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectWithOverrides(slug);
  if (!project) return { title: "Not Found" };
  return {
    title: project.name,
    description: project.about
      ? project.about.slice(0, 160)
      : `${project.name} — a research project from the Division of Health AI at Northwell Health.`,
    alternates: { canonical: `/research/${slug}` },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectWithOverrides(slug);
  if (!project) notFound();

  const [teamMembers, pubs, allProjects] = await Promise.all([
    getResearchersForProject(project.id, project.researcherIds),
    getPublicationsByIds(project.publicationIds),
    getAllProjectsWithOverrides(),
  ]);

  const projectIndex = allProjects.findIndex((p) => p.id === project.id);
  const indexLabel = projectIndex >= 0 ? String(projectIndex + 1).padStart(2, "0") : project.id.padStart(2, "0");

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "ResearchProject",
    name: project.name,
    description: project.about?.slice(0, 200),
    url: `https://divhealthai.org/research/${project.slug}`,
    parentOrganization: {
      "@type": "ResearchOrganization",
      name: "Division of Health AI",
      url: "https://divhealthai.org",
    },
    member: teamMembers.map((r) => ({
      "@type": "Person",
      name: r.name,
      url: `https://divhealthai.org/team/${r.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://divhealthai.org" },
      { "@type": "ListItem", position: 2, name: "Research", item: "https://divhealthai.org/research" },
      { "@type": "ListItem", position: 3, name: project.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            href="/research"
            className="label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200 inline-flex items-center gap-2"
          >
            ← Research index
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MonoTag accent="pulse">Vertical · {indexLabel}</MonoTag>
            <span className="label-mono text-text-dim">
              {teamMembers.length} researcher{teamMembers.length !== 1 ? "s" : ""} · {pubs.length} paper{pubs.length !== 1 ? "s" : ""}
            </span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] tracking-[-0.02em] leading-[1.0]">
            <EditableText
              entity="project"
              entityId={project.id}
              field="name"
              value={project.name}
              as="span"
              className="font-display tracking-[-0.02em] leading-[1.0]"
            />
          </h1>
        </div>
      </section>

      {/* Description */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <MonoTag accent="dim">Abstract</MonoTag>
            </div>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <EditableText
                entity="project"
                entityId={project.id}
                field="about"
                value={project.about}
                multiline
                as="p"
                className="text-lg text-foreground/90 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {teamMembers.length > 0 && (
        <section className="py-16 border-t border-border bg-surface/30">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-3">
                <MonoTag accent="dim">Team · {teamMembers.length}</MonoTag>
                <h2 className="font-display text-3xl tracking-[-0.015em] mt-3 leading-tight">
                  Who&apos;s working on this
                </h2>
              </div>
              <div className="col-span-12 md:col-span-9">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
                  {teamMembers.map((r, i) => (
                    <li key={r.id} className="bg-background">
                      <Link
                        href={`/team/${r.slug}`}
                        className="group block p-4 hover:bg-surface/50 transition-colors duration-200"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="label-mono text-text-dim w-8 tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-display text-lg text-foreground group-hover:text-accent-pulse transition-colors duration-200 block leading-tight">
                              {r.name}
                            </span>
                            {r.title && (
                              <span className="text-xs text-text-muted block mt-0.5">
                                {r.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Publications */}
      {pubs.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-3">
                <MonoTag accent="dim">Papers · {pubs.length}</MonoTag>
                <h2 className="font-display text-3xl tracking-[-0.015em] mt-3 leading-tight">
                  Related publications
                </h2>
              </div>
              <div className="col-span-12 md:col-span-9">
                <div>
                  {pubs.map((pub, i) => (
                    <div
                      key={pub.id}
                      className="py-4 border-t border-border first:border-t-0"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="label-mono text-text-dim tabular-nums">
                          {String(i + 1).padStart(3, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <MonoTag accent="secondary">{pub.journal}</MonoTag>
                          {pub.publicationUrl ? (
                            <a
                              href={pub.publicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-1.5 font-display text-lg text-foreground hover:text-accent-pulse transition-colors duration-200 leading-snug"
                            >
                              {pub.name}
                            </a>
                          ) : (
                            <p className="mt-1.5 font-display text-lg text-foreground leading-snug">
                              {pub.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
