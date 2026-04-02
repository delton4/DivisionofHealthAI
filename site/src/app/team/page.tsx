import type { Metadata } from "next";
import Link from "next/link";
import { TeamCard } from "@/components/TeamCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { EditableText } from "@/components/EditableText";
import { getAllResearchersWithOverrides, alumni } from "@/data";

export const metadata: Metadata = { title: "Team" };
export const revalidate = 60;

export default async function TeamPage() {
  const allResearchers = await getAllResearchersWithOverrides();
  const leader = allResearchers.find((r) => r.id === "1");
  const rest = allResearchers
    .filter((r) => r.id !== "1")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Team</h1>
        </div>
      </section>

      {leader && (
        <AnimatedSection className="pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="p-6 md:p-8">
              <Link href={`/team/${leader.slug}`} className="group">
                <h2 className="font-display text-2xl md:text-3xl text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40">
                  {leader.name}
                </h2>
              </Link>
              <EditableText
                entity="researcher"
                entityId={leader.id}
                field="title"
                value={leader.title}
                as="p"
                className="text-sm text-text-muted mt-1"
              />
              {leader.about && (
                <div className="mt-4 max-w-2xl">
                  <EditableText
                    entity="researcher"
                    entityId={leader.id}
                    field="about"
                    value={leader.about}
                    multiline
                    as="p"
                    className="text-sm text-text-secondary leading-relaxed line-clamp-3"
                  />
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((researcher) => (
              <TeamCard key={researcher.id} researcher={researcher} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Alumni */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl tracking-tight mb-6">Alumni</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
            {alumni.map((a) => (
              <span key={a.name}>
                {a.name} {a.credentials}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
