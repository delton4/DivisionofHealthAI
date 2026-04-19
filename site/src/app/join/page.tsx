import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { EditableText } from "@/components/EditableText";
import { MonoTag } from "@/components/MonoTag";
import { getPageOverrides } from "@/data";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Join the Division of Health AI at Northwell Health. Open positions for researchers, engineers, clinicians, and research scholars.",
  alternates: { canonical: "/join" },
};
export const revalidate = 60;

const defaults: Record<string, string> = {
  intro:
    "We're looking for talented researchers, engineers, and clinicians who want to make a real impact on patient care through artificial intelligence.",
  scholar_desc:
    "Join our lab for a research rotation. Work alongside our team on active projects, gain hands-on experience with clinical AI development, and contribute to publications.",
  collab_desc:
    "Partner with us on joint research projects. We collaborate with academic institutions, healthcare systems, and industry partners to advance health AI.",
  location_desc:
    "Northwell Health, one of the largest healthcare systems in the US and home to the Feinstein Institutes for Medical Research.",
};

export default async function JoinPage() {
  const overrides = await getPageOverrides("join");
  const get = (key: string) => overrides[key] || defaults[key];

  const sections = [
    {
      tag: "§ 01 · Visiting Scholars",
      title: "Scholar Program",
      descKey: "scholar_desc",
      bullets: [
        "3 to 12 month research rotations",
        "Access to clinical datasets & compute",
        "Mentorship from senior researchers",
        "Publication opportunities",
      ],
    },
    {
      tag: "§ 02 · Collaboration",
      title: "Research partnerships",
      descKey: "collab_desc",
      bullets: [
        "Joint grant applications",
        "Shared datasets & infrastructure",
        "Co-authored publications",
        "Technology transfer",
      ],
    },
  ];

  return (
    <>
      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <MonoTag accent="pulse">Join · Div.HAI</MonoTag>
          <div className="mt-4 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8">
              <h1 className="font-display text-[clamp(3rem,8vw,6rem)] tracking-[-0.02em] leading-[0.95]">
                <span className="italic text-text-secondary">Come</span> build
                <br />
                with us.
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4">
              <EditableText
                entity="page"
                entityId="join"
                field="intro"
                value={get("intro")}
                multiline
                as="p"
                className="text-text-secondary leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {sections.map((section, i) => (
        <AnimatedSection
          key={section.tag}
          className={`py-20 ${i > 0 ? "border-t border-border" : ""}`}
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <MonoTag accent="dim">{section.tag}</MonoTag>
                <h2 className="font-display text-3xl md:text-4xl tracking-[-0.015em] mt-4 leading-tight">
                  {section.title}
                </h2>
              </div>
              <div className="col-span-12 md:col-span-8 max-w-2xl">
                <EditableText
                  entity="page"
                  entityId="join"
                  field={section.descKey}
                  value={get(section.descKey)}
                  multiline
                  as="p"
                  className="text-lg text-foreground/90 leading-relaxed"
                />
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
                  {section.bullets.map((b, bi) => (
                    <li
                      key={b}
                      className="bg-background p-4 flex items-start gap-3"
                    >
                      <span className="label-mono text-text-dim pt-0.5">
                        {String(bi + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-text-secondary">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* Location + CTA */}
      <AnimatedSection className="py-20 border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <MonoTag accent="dim">§ 03 · Location</MonoTag>
              <h2 className="font-display text-3xl md:text-4xl tracking-[-0.015em] mt-4 leading-tight">
                Where we work
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8 max-w-2xl">
              <EditableText
                entity="page"
                entityId="join"
                field="location_desc"
                value={get("location_desc")}
                multiline
                as="p"
                className="text-lg text-foreground/90 leading-relaxed"
              />
              <div className="mt-6 border border-border p-5 bg-background">
                <MonoTag accent="signal">Address</MonoTag>
                <p className="mt-2 text-foreground">
                  350 Community Drive
                  <br />
                  Manhasset, NY 11030
                </p>
                <p className="mt-1 label-mono text-text-dim">
                  41.0325° N · 73.7001° W
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-border grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-8">
              <MonoTag accent="pulse">Contact</MonoTag>
              <h3 className="font-display text-5xl md:text-6xl tracking-[-0.015em] mt-4 leading-[0.95]">
                <a
                  href="mailto:tzanos@northwell.edu"
                  className="link-underline pb-1"
                >
                  tzanos@northwell.edu
                </a>
              </h3>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <Link
                href="/team"
                className="label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200"
              >
                Meet the team →
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
