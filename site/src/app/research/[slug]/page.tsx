import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  projects,
  getProject,
  getResearchersByIds,
  getPublicationsByIds,
} from "@/data";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not Found" };
  return { title: project.name };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const teamMembers = getResearchersByIds(project.researcherIds);
  const pubs = getPublicationsByIds(project.publicationIds);

  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/research"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
        >
          Back to Research
        </Link>

        <div className="mt-8">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {teamMembers.length} researchers · {pubs.length} publications
          </p>
        </div>

        <p className="text-text-secondary mt-8 leading-relaxed">{project.about}</p>

        {teamMembers.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-xl mb-4">Team</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {teamMembers.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/team/${r.slug}`}
                    className="block py-2 text-sm"
                  >
                    <span className="text-foreground hover:underline underline-offset-4 decoration-text-muted/40">
                      {r.name}
                    </span>
                    {r.title && (
                      <span className="text-text-muted ml-1.5 text-xs">
                        {r.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pubs.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-xl mb-4">
              Publications ({pubs.length})
            </h2>
            <div className="space-y-4">
              {pubs.map((pub) => (
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
