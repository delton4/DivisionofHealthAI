import type { Metadata } from "next";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAllPublicationsWithOverrides } from "@/data";
import { projects } from "@/data";
import { PublicationFilter } from "./PublicationFilter";

export const metadata: Metadata = { title: "Publications" };
export const revalidate = 60;

const projectFilters = projects.map((p) => ({
  id: p.id,
  name: p.name,
  pubIds: p.publicationIds,
}));

export default async function PublicationsPage() {
  const allPubs = await getAllPublicationsWithOverrides();

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

      <AnimatedSection className="pb-24">
        <PublicationFilter
          publications={allPubs}
          journals={journals}
          projectFilters={projectFilters}
        />
      </AnimatedSection>
    </>
  );
}
