import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/EditableText";
import {
  researchers,
  getResearcherWithOverrides,
  getProjectsByIds,
  getPublicationsByIds,
} from "@/data";

export const revalidate = 60;

const photos: Record<string, string> = {
  "theodoros-zanos": "/zanos.jpg",
};

export function generateStaticParams() {
  return researchers.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);
  if (!researcher) return { title: "Not Found" };
  return { title: researcher.name };
}

export default async function ResearcherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);
  if (!researcher) notFound();

  const relatedProjects = getProjectsByIds(researcher.projectIds);
  const relatedPubs = getPublicationsByIds(researcher.publicationIds);

  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/team"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
        >
          Back to Team
        </Link>

        {photos[researcher.slug] && (
          <Image
            src={photos[researcher.slug]}
            alt={researcher.name}
            width={200}
            height={200}
            className="rounded-md object-cover w-36 h-36 md:w-48 md:h-48 mt-8"
          />
        )}

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
        {researcher.title && (
          <p className="text-text-muted mt-1">
            <EditableText
              entity="researcher"
              entityId={researcher.id}
              field="title"
              value={researcher.title}
            />
          </p>
        )}

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
          {!researcher.email && !researcher.linkedin && (
            <span className="text-text-muted/50">
              <EditableText
                entity="researcher"
                entityId={researcher.id}
                field="email"
                value=""
                as="span"
                className="text-text-muted"
              />
            </span>
          )}
        </div>

        {researcher.about && (
          <div className="mt-6">
            <EditableText
              entity="researcher"
              entityId={researcher.id}
              field="about"
              value={researcher.about}
              multiline
              as="p"
              className="text-text-secondary leading-relaxed"
            />
          </div>
        )}

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
