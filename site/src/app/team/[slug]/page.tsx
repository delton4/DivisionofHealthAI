import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
  getAllResearchersWithOverrides,
  getResearcherWithOverrides,
  getProjectsByIds,
  getPublicationsByIds,
} from "@/data";

export const revalidate = 60;

const staticPhotos: Record<string, string> = {
  "theodoros-zanos": "/zanos.jpg",
};

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

export default async function ResearcherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);
  if (!researcher) notFound();

  const [relatedProjects, relatedPubs] = await Promise.all([
    getProjectsByIds(researcher.projectIds),
    getPublicationsByIds(researcher.publicationIds),
  ]);

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

        {relatedProjects.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-xl mb-4">Research Projects</h2>
            <ul className="space-y-3">
              {relatedProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/research/${project.slug}`}
                    className="text-sm text-foreground underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200"
                  >
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedPubs.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-xl mb-4">
              Publications ({relatedPubs.length})
            </h2>
            <div className="space-y-4">
              {relatedPubs.map((pub) => (
                <div key={pub.id} className="border-b border-border pb-4">
                  <span className="text-xs italic text-text-muted">
                    {pub.journal}
                  </span>
                  {pub.publicationUrl ? (
                    <a
                      href={pub.publicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium mt-0.5 text-foreground hover:underline underline-offset-4 decoration-text-muted/40"
                    >
                      {pub.name}
                    </a>
                  ) : (
                    <p className="text-sm font-medium mt-0.5">{pub.name}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
