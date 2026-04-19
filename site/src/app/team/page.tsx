import type { Metadata } from "next";
import { TeamCard } from "@/components/TeamCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { MonoTag } from "@/components/MonoTag";
import { getAllResearchersWithOverrides, getAllAlumni } from "@/data";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the researchers, engineers, and clinicians of the Division of Health AI at Northwell Health.",
  alternates: { canonical: "/team" },
};
export const revalidate = 60;

export default async function TeamPage() {
  const [allResearchers, allAlumni] = await Promise.all([
    getAllResearchersWithOverrides(),
    getAllAlumni(),
  ]);
  const sorted = [...allResearchers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* Page header */}
      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <MonoTag accent="pulse">Roster · Div.HAI</MonoTag>
          <div className="mt-4 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8">
              <h1 className="font-display text-[clamp(3rem,8vw,6rem)] tracking-[-0.02em] leading-[0.95]">
                <span className="italic text-text-secondary">The</span> team
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="text-sm text-text-muted leading-relaxed max-w-xs md:ml-auto">
                {allResearchers.length} active researchers, engineers &
                clinicians across five verticals.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 label-mono text-text-dim">
            <span>Total · {String(allResearchers.length).padStart(3, "0")}</span>
            <span>·</span>
            <span>Alumni · {String(allAlumni.length).padStart(3, "0")}</span>
            <span>·</span>
            <span className="text-text-muted">Sorted A → Z</span>
          </div>
        </div>
      </section>

      <AnimatedSection className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((researcher, i) => (
              <TeamCard
                key={researcher.id}
                researcher={researcher}
                index={i}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Alumni */}
      {allAlumni.length > 0 && (
        <section className="py-20 border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-6">
            <MonoTag accent="dim">Alumni · Past members</MonoTag>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.015em] mt-3 mb-8">
              Previously at the lab
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
              {allAlumni.map((a) => (
                <div
                  key={`${a.name}-${a.credentials}`}
                  className="flex items-baseline gap-2 text-sm border-b border-border/60 py-2.5"
                >
                  <span className="text-text-secondary">{a.name}</span>
                  {a.credentials && (
                    <span className="label-mono text-text-dim ml-auto">
                      {a.credentials}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
