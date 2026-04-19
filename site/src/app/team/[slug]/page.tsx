import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MonoTag } from "@/components/MonoTag";
import {
  getAllResearchersWithOverrides,
  getResearcherWithOverrides,
  getProjectsByIds,
  getPublicationsByIds,
  getResearcherAssociations,
  getAllProjectsWithOverrides,
  getAllPublicationsWithOverrides,
} from "@/data";
import { AssociationManager } from "@/components/AssociationManager";
import type { AssociationItem } from "@/components/AssociationManager";
import { staticPhotos } from "@/data/static-photos";
import type { Researcher } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const visible = await getAllResearchersWithOverrides();
  return visible.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);
  if (!researcher) return { title: "Not Found" };
  return {
    title: researcher.name,
    description: researcher.about
      ? researcher.about.slice(0, 160)
      : `${researcher.name}, ${researcher.title} at the Division of Health AI, Northwell Health.`,
    alternates: { canonical: `/team/${slug}` },
  };
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="font-display text-xl mb-4">{title}</h2>
      <div className="space-y-3">
        <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
      </div>
    </section>
  );
}

async function ResearcherProjects({ researcher }: { researcher: Researcher }) {
  const { projectIds } = await getResearcherAssociations(
    researcher.id,
    researcher.publicationIds,
    researcher.projectIds
  );

  const [relatedProjects, allProjects] = await Promise.all([
    getProjectsByIds(projectIds),
    getAllProjectsWithOverrides(),
  ]);

  return (
    <AssociationManager
      researcherId={researcher.id}
      entityType="project"
      sectionTitle="Research Projects"
      currentItems={relatedProjects.map((p): AssociationItem => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
      }))}
      allItems={allProjects.map((p): AssociationItem => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
      }))}
    />
  );
}

async function ResearcherPublications({ researcher }: { researcher: Researcher }) {
  const { publicationIds } = await getResearcherAssociations(
    researcher.id,
    researcher.publicationIds,
    researcher.projectIds
  );

  const [relatedPubs, allPubs] = await Promise.all([
    getPublicationsByIds(publicationIds),
    getAllPublicationsWithOverrides(),
  ]);

  return (
    <AssociationManager
      researcherId={researcher.id}
      entityType="publication"
      sectionTitle="Publications"
      currentItems={relatedPubs.map((p): AssociationItem => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        journal: p.journal,
        publicationUrl: p.publicationUrl,
      }))}
      allItems={allPubs.map((p): AssociationItem => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        journal: p.journal,
        publicationUrl: p.publicationUrl,
      }))}
    />
  );
}

export default async function ResearcherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);
  if (!researcher) notFound();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: researcher.name,
    jobTitle: researcher.title,
    url: `https://divhealthai.org/team/${researcher.slug}`,
    description: researcher.about?.slice(0, 200),
    affiliation: {
      "@type": "ResearchOrganization",
      name: "Division of Health AI",
      url: "https://divhealthai.org",
      parentOrganization: {
        "@type": "Organization",
        name: "Feinstein Institutes for Medical Research",
        url: "https://feinstein.northwell.edu",
      },
    },
    worksFor: {
      "@type": "Organization",
      name: "Northwell Health",
      url: "https://www.northwell.edu",
    },
    ...(researcher.email && { email: researcher.email }),
    ...(researcher.linkedin && { sameAs: [researcher.linkedin] }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://divhealthai.org" },
      { "@type": "ListItem", position: 2, name: "Team", item: "https://divhealthai.org/team" },
      { "@type": "ListItem", position: 3, name: researcher.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            href="/team"
            className="label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200 inline-flex items-center gap-2"
          >
            ← Team roster
          </Link>

          <div className="mt-10 grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-4">
              <div className="border border-border bg-surface/30">
                <PhotoUpload
                  researcherId={researcher.id}
                  researcherSlug={researcher.slug}
                  researcherName={researcher.name}
                  photoUrl={researcher.photo || staticPhotos[researcher.slug]}
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <MonoTag accent="pulse">Researcher profile</MonoTag>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] tracking-[-0.02em] leading-[0.98]">
                <EditableText
                  entity="researcher"
                  entityId={researcher.id}
                  field="name"
                  value={researcher.name}
                  as="span"
                  className="font-display tracking-[-0.02em]"
                />
              </h1>
              <p className="mt-4 text-lg text-text-secondary leading-snug max-w-xl">
                <EditableText
                  entity="researcher"
                  entityId={researcher.id}
                  field="title"
                  value={researcher.title || "No title yet. Click to add one."}
                />
              </p>

              <div className="mt-5 flex flex-wrap gap-4 label-mono">
                {researcher.email && (
                  <a
                    href={`mailto:${researcher.email}`}
                    className="text-text-muted hover:text-accent-pulse transition-colors duration-200"
                  >
                    ✉ {researcher.email}
                  </a>
                )}
                {researcher.linkedin && (
                  <a
                    href={researcher.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent-pulse transition-colors duration-200"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <MonoTag accent="dim">Bio</MonoTag>
            </div>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <EditableText
                entity="researcher"
                entityId={researcher.id}
                field="about"
                value={researcher.about || "No bio yet. Click to add one."}
                multiline
                as="p"
                className="text-lg text-foreground/90 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <Suspense fallback={<SectionSkeleton title="Research Projects" />}>
          <ResearcherProjects researcher={researcher} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Publications" />}>
          <ResearcherPublications researcher={researcher} />
        </Suspense>
      </div>
      <div className="pb-20" />
    </>
  );
}
