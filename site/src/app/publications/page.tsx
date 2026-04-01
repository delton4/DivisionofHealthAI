import type { Metadata } from "next";
import { PublicationCard } from "@/components/PublicationCard";
import { publications } from "@/data";

export const metadata: Metadata = {
  title: "Publications",
};

export default function PublicationsPage() {
  return (
    <>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Publications</h1>
          <div className="mt-3 w-12 h-0.5 bg-accent-warm" />
          <p className="mt-6 text-text-secondary max-w-2xl leading-relaxed">
            {publications.length} peer-reviewed publications in journals including
            Nature Communications, PNAS, JAMA, and Nature Machine Intelligence.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      </section>
    </>
  );
}
