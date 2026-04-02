import type { Metadata } from "next";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AccentLine } from "@/components/AccentLine";
import { publications } from "@/data";

export const metadata: Metadata = {
  title: "Publications",
};

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
        <div className="mx-auto max-w-3xl px-6">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      </AnimatedSection>
    </>
  );
}
