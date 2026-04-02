import type { Metadata } from "next";
import Link from "next/link";
import { TeamCard } from "@/components/TeamCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { researchers } from "@/data";

export const metadata: Metadata = {
  title: "Team",
};

export default function TeamPage() {
  const leader = researchers.find((r) => r.id === "1");
  const rest = researchers
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
            <Link
              href={`/team/${leader.slug}`}
              className="block p-6 md:p-8 group"
            >
              <h2 className="font-display text-2xl md:text-3xl text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40">
                {leader.name}
              </h2>
              <p className="text-sm text-text-muted mt-1">{leader.title}</p>
              {leader.about && (
                <p className="text-sm text-text-secondary mt-4 max-w-2xl leading-relaxed line-clamp-3">
                  {leader.about}
                </p>
              )}
            </Link>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((researcher) => (
              <TeamCard key={researcher.id} researcher={researcher} />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
