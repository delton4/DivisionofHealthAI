import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPublicationsWithOverrides, getAllProjectsWithOverrides } from "@/data";
import { PublicationFilter } from "./PublicationFilter";

export const metadata: Metadata = {
  title: "Publications",
  description: "Peer-reviewed publications from the Division of Health AI, spanning clinical decision support, wearable monitoring, neural decoding, and medical imaging.",
  alternates: { canonical: "/publications" },
};
export const revalidate = 60;

const PAGE_SIZE = 50;

async function PublicationsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; journal?: string; project?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const journalFilter = params.journal || null;
  const projectFilter = params.project || null;

  const [allPubs, allProjects] = await Promise.all([
    getAllPublicationsWithOverrides(),
    getAllProjectsWithOverrides(),
  ]);

  const projectFilters = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    pubIds: p.publicationIds,
  }));

  // Apply server-side filters
  let filtered = allPubs;
  if (projectFilter) {
    const proj = projectFilters.find((p) => p.id === projectFilter);
    if (proj) filtered = filtered.filter((pub) => proj.pubIds.includes(pub.id));
  }
  if (journalFilter) {
    filtered = filtered.filter((pub) => pub.journal === journalFilter);
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const journals = Array.from(
    new Set(allPubs.map((p) => p.journal).filter(Boolean))
  ).sort();

  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Publications</h1>
          <p className="mt-6 text-text-secondary max-w-2xl leading-relaxed">
            {allPubs.length} peer-reviewed publications in journals including
            Nature Communications, PNAS, JAMA, and Nature Machine Intelligence.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <PublicationFilter
          publications={paginated}
          journals={journals}
          projectFilters={projectFilters}
          totalCount={totalCount}
          currentPage={safePage}
          totalPages={totalPages}
          activeJournal={journalFilter}
          activeProject={projectFilter}
        />
      </section>
    </>
  );
}

export default function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; journal?: string; project?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="pt-36 pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="h-10 w-48 bg-surface rounded animate-pulse" />
            <div className="mt-6 h-4 w-96 bg-surface rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <PublicationsContent searchParams={searchParams} />
    </Suspense>
  );
}
