import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { StatsStrip } from "@/components/StatsStrip";
import { MarqueeTicker } from "@/components/MarqueeTicker";
import { MonoTag } from "@/components/MonoTag";
import { EditableText } from "@/components/EditableText";
import {
  getAllProjectsWithOverrides,
  getAllPublicationsWithOverrides,
  getAllResearchersWithOverrides,
  getPageOverrides,
} from "@/data";

export const revalidate = 60;

export default async function HomePage() {
  const [allProjects, allPubs, allResearchers, pageOverrides] = await Promise.all([
    getAllProjectsWithOverrides(),
    getAllPublicationsWithOverrides(),
    getAllResearchersWithOverrides(),
    getPageOverrides("home"),
  ]);

  const featuredPubs = allPubs.slice(0, 5);
  const highlightPubId = pageOverrides.highlight_pub_id || "2";
  const highlightPub = allPubs.find((p) => p.id === highlightPubId);

  const heroSubtitle =
    pageOverrides.subtitle ||
    "Machine learning for early diagnosis, deterioration prediction, and personalized therapeutics. We build clinical AI at the bedside.";

  const highlightDesc =
    pageOverrides.highlight_desc ||
    "A wearable-based deep learning model that identifies the onset of clinical deterioration earlier than traditional early warning systems, predicting adverse outcomes up to 17 hours in advance with over 81% accuracy.";

  const tickerItems = [
    "1.5M hospitalizations modelled",
    "17 hr median lead-time on deterioration prediction",
    "60 vagus nerves reconstructed in 3D",
    "$3.2M NIH R01 · continuous patient monitoring",
    "$6.7M NIH · vagus nerve digital twin",
    "Deployed across 10 Northwell hospitals",
    "200 TB of histology imaging",
    "Nature Comms · PNAS · JAMA · NEJM AI",
    "Est. 2018 · Manhasset, New York",
  ];

  return (
    <>
      <Hero subtitle={heroSubtitle} />

      <MarqueeTicker items={tickerItems} />

      <StatsStrip
        stats={[
          { label: "Research verticals", value: String(allProjects.length).padStart(2, "0") },
          { label: "Peer-reviewed papers", value: String(allPubs.length), suffix: "+" },
          { label: "Researchers & clinicians", value: String(allResearchers.length) },
          { label: "Year founded", value: "2018" },
        ]}
      />

      {/* ── Mission block ───────────────────────────────── */}
      <AnimatedSection className="relative py-24 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <MonoTag accent="pulse">Mission · 01</MonoTag>
              <h2 className="font-display text-4xl md:text-5xl tracking-[-0.015em] leading-[1.02] mt-4">
                Clinical AI that <span className="italic text-text-secondary">ships.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-7 md:col-start-6">
              <p className="text-xl md:text-2xl font-display text-foreground/90 leading-[1.35] tracking-[-0.005em]">
                We build machine-learning systems that live inside the hospital —
                monitoring patients before they crash, reading images before a
                clinician picks them up, and decoding nerves before they misfire.
              </p>
              <p className="mt-6 text-text-secondary leading-relaxed max-w-xl">
                Every model we publish is designed to survive the gap between
                notebook and bedside. Five research verticals, one
                translational pipeline.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 label-mono text-accent-pulse hover:text-foreground transition-colors duration-200"
              >
                Read our approach
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Research verticals ──────────────────────────── */}
      <AnimatedSection className="pt-20 pb-4">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Research · 02"
            title="Five verticals"
            href="/research"
            action="All projects"
          />
        </div>
        <div>
          {allProjects.slice(0, 5).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
          <div className="border-t border-border" />
        </div>
      </AnimatedSection>

      {/* ── Paper highlight (editorial feature) ─────────── */}
      {highlightPub && (
        <AnimatedSection className="relative pt-24 pb-20 border-t border-border">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-pulse/40 to-transparent" />
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <MonoTag accent="pulse">Featured · 03</MonoTag>
                <h2 className="font-display text-4xl tracking-[-0.015em] mt-4 leading-tight">
                  Signal of the month
                </h2>
                <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
                  A recent paper our team is watching — not because it&apos;s ours,
                  but because it changes how we work.
                </p>
              </div>

              <div className="col-span-12 md:col-span-8 relative">
                {/* Decorative crosshair corners */}
                <div className="absolute -top-2 -left-2 w-3 h-3 border-l border-t border-accent-pulse/60" />
                <div className="absolute -top-2 -right-2 w-3 h-3 border-r border-t border-accent-pulse/60" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 border-l border-b border-accent-pulse/60" />
                <div className="absolute -bottom-2 -right-2 w-3 h-3 border-r border-b border-accent-pulse/60" />

                <div className="p-8 md:p-10 bg-surface/40 border border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <MonoTag accent="signal">{highlightPub.journal}</MonoTag>
                    <span className="label-mono text-text-dim">· Peer-reviewed</span>
                  </div>
                  <a
                    href={highlightPub.publicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block mt-4"
                  >
                    <h3 className="font-display text-2xl md:text-3xl leading-[1.15] tracking-[-0.01em] text-foreground group-hover:text-accent-pulse transition-colors duration-200">
                      {highlightPub.name}
                    </h3>
                  </a>
                  <div className="mt-5">
                    <EditableText
                      entity="page"
                      entityId="home"
                      field="highlight_desc"
                      value={highlightDesc}
                      multiline
                      as="p"
                      className="text-text-secondary leading-relaxed max-w-2xl"
                    />
                  </div>
                  <a
                    href={highlightPub.publicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 label-mono text-accent-pulse hover:text-foreground transition-colors duration-200"
                  >
                    Read paper ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Recent publications feed ────────────────────── */}
      <AnimatedSection className="py-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Publications · 04"
            title="Recent papers"
            href="/publications"
            action={`All ${allPubs.length}`}
          />
          <div>
            {featuredPubs.map((pub, i) => (
              <PublicationCard key={pub.id} publication={pub} index={i} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Join CTA ───────────────────────────────────── */}
      <AnimatedSection className="relative py-24 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-8">
              <MonoTag accent="pulse">Join · 05</MonoTag>
              <h2 className="font-display text-4xl md:text-6xl tracking-[-0.015em] leading-[1.02] mt-4 max-w-2xl">
                Come work on problems that
                <span className="italic text-text-secondary"> matter.</span>
              </h2>
              <p className="mt-6 text-text-secondary leading-relaxed max-w-xl">
                Research rotations for engineers, clinicians, and scientists.
                Joint grants with academic and industry partners. Access to one
                of the largest health systems in the country.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <Link
                href="/join"
                className="group inline-flex items-center gap-3 text-foreground"
              >
                <span className="font-display text-2xl md:text-3xl link-underline pb-1">
                  Get in touch
                </span>
                <span
                  aria-hidden="true"
                  className="label-mono text-accent-pulse transform group-hover:translate-x-1 transition-transform duration-200"
                >
                  →
                </span>
              </Link>
              <p className="mt-4 label-mono text-text-dim">
                tzanos@northwell.edu
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
