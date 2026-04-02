import type { Metadata } from "next";
import { AccentLine } from "@/components/AccentLine";
import { AnimatedSection } from "@/components/AnimatedSection";
import { publications, projects } from "@/data";
import { PublicationFilter } from "./PublicationFilter";

export const metadata: Metadata = {
  title: "Publications",
};

// Pre-compute filter data at build time
const journals = Array.from(
  new Set(publications.map((p) => p.journal).filter(Boolean))
).sort();

const projectFilters = projects.map((p) => ({
  id: p.id,
  name: p.name,
  pubIds: p.publicationIds,
}));

export default function PublicationsPage() {
  return (
    <>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">
            <span className="line-reveal"><span>Publications</span></span>
          </h1>
          <AccentLine />
          <p className="hero-subtitle mt-6 text-text-secondary max-w-2xl leading-relaxed">
            {publications.length} peer-reviewed publications in journals including
            Nature Communications, PNAS, JAMA, and Nature Machine Intelligence.
          </p>
        </div>
      </section>

      <AnimatedSection className="pb-20">
        <PublicationFilter
          publications={publications}
          journals={journals}
          projectFilters={projectFilters}
        />
      </AnimatedSection>
    </>
  );
}
