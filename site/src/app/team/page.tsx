import type { Metadata } from "next";
import { TeamCard } from "@/components/TeamCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAllResearchersWithOverrides, getAllAlumni } from "@/data";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the researchers, engineers, and clinicians of the Division of Health AI at Northwell Health.",
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
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Team</h1>
        </div>
      </section>

      <AnimatedSection className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((researcher) => (
              <TeamCard key={researcher.id} researcher={researcher} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Alumni */}
      {allAlumni.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl tracking-tight mb-6">Alumni</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
              {allAlumni.map((a) => (
                <span key={`${a.name}-${a.credentials}`}>
                  {a.name} {a.credentials}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
