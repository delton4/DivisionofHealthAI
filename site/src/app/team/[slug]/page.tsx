import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { PhotoUpload } from "@/components/PhotoUpload";
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
    <div className="pt-36 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/team"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
        >
          Back to Team
        </Link>

        <PhotoUpload
          researcherId={researcher.id}
          researcherSlug={researcher.slug}
          researcherName={researcher.name}
          photoUrl={researcher.photo || staticPhotos[researcher.slug]}
        />

        <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-6">
          <EditableText
            entity="researcher"
            entityId={researcher.id}
            field="name"
            value={researcher.name}
            as="span"
            className="font-display text-3xl md:text-4xl tracking-tight"
          />
        </h1>
        <p className="text-text-muted mt-1">
          <EditableText
            entity="researcher"
            entityId={researcher.id}
            field="title"
            value={researcher.title || "No title yet. Click to add one."}
          />
        </p>

        <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted">
          {researcher.email && (
            <a href={`mailto:${researcher.email}`} className="hover:text-text-secondary transition-colors duration-200">
              {researcher.email}
            </a>
          )}
          {researcher.linkedin && (
            <a href={researcher.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors duration-200">
              LinkedIn
            </a>
          )}
        </div>

        <div className="mt-6">
          <EditableText
            entity="researcher"
            entityId={researcher.id}
            field="about"
            value={researcher.about || "No bio yet. Click to add one."}
            multiline
            as="p"
            className="text-text-secondary leading-relaxed"
          />
        </div>

        <Suspense fallback={<SectionSkeleton title="Research Projects" />}>
          <ResearcherProjects researcher={researcher} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Publications" />}>
          <ResearcherPublications researcher={researcher} />
        </Suspense>
      </div>
    </div>
  );
}
