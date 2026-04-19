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
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { NerveScope } from "@/components/NerveScope";
import { Magnetic } from "@/components/Magnetic";
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

  const totalEdges = allResearchers.reduce(
    (a, r) => a + r.projectIds.length,
    0,
  );

  return (
    <>
      <Hero subtitle={heroSubtitle} />

      <MarqueeTicker items={tickerItems} />

      <StatsStrip
        stats={[
          { label: "Research verticals", value: allProjects.length },
          { label: "Peer-reviewed papers", value: allPubs.length, suffix: "+" },
          { label: "Researchers & clinicians", value: allResearchers.length },
          { label: "Year founded", value: 2018 },
        ]}
      />

      {/* ── Mission block ───────────────────────────────── */}
      <AnimatedSection className="relative py-32 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 md:col-span-4">
              <MonoTag accent="pulse">Mission · 01</MonoTag>
              <h2
                className="font-display tracking-[-0.025em] leading-[0.92] mt-5"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                Clinical AI
                <br />
                that <span className="italic text-text-secondary">ships.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-7 md:col-start-6 md:mt-8">
              <p className="text-2xl md:text-3xl font-display text-foreground/95 leading-[1.3] tracking-[-0.008em]">
                We build machine-learning systems that live inside the hospital —
                monitoring patients before they crash, reading images before a
                clinician picks them up, and decoding nerves before they misfire.
              </p>
              <p className="mt-8 text-text-secondary leading-relaxed max-w-xl">
                Every model we publish is designed to survive the gap between
                notebook and bedside. Five research verticals, one
                translational pipeline.
              </p>
              <Link
                href="/about"
                data-cursor="link"
                className="mt-10 inline-flex items-center gap-2 label-mono text-accent-pulse hover:text-foreground transition-colors duration-200"
              >
                Read our approach
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Knowledge graph ─────────────────────────────── */}
      <AnimatedSection className="relative pt-20 pb-4 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Network · 02"
            title="The lab, as a graph"
          />
          <p className="text-text-secondary max-w-2xl leading-relaxed -mt-4 mb-8">
            Every circle is a person. Every glowing node is a project they own.
            Pull a node, watch the lab rearrange itself.
          </p>
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="relative h-[640px] md:h-[720px] border border-border bg-background/60 overflow-hidden">
            {/* Corner framing ticks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-accent-pulse/60" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-accent-pulse/60" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-accent-pulse/60" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-accent-pulse/60" />
            <KnowledgeGraph
              researchers={allResearchers}
              projects={allProjects}
              className="absolute inset-0"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 label-mono text-text-dim">
            <span>
              {allResearchers.length} researchers · {allProjects.length} projects · {totalEdges} edges
            </span>
            <span className="ml-auto text-text-muted">
              Real-time force simulation · No data stored
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Research verticals ──────────────────────────── */}
      <AnimatedSection className="pt-24 pb-4 border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Research · 03"
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

      {/* ── Nerve scope — big editorial visual ─────────── */}
      <section className="relative border-t border-border">
        <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
          <NerveScope className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />

          <div className="absolute inset-0 flex items-end">
            <div className="relative w-full px-6 pb-16">
              <div className="mx-auto max-w-6xl">
                <MonoTag accent="pulse">Instrument · 04</MonoTag>
                <h2
                  className="font-display tracking-[-0.025em] leading-[0.92] mt-4 max-w-4xl"
                  style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
                >
                  A digital twin of
                  <br />
                  <span className="italic text-text-secondary">the vagus.</span>
                </h2>
                <p className="mt-6 text-lg md:text-xl text-foreground/85 leading-relaxed max-w-2xl">
                  200 TB of histology. 60 nerves. One 3D nn-U-Net pipeline. A
                  $6.7M NIH grant to build the most detailed model of a cranial
                  nerve that exists — and to teach machines to read it.
                </p>
              </div>
            </div>
          </div>

          {/* Top HUD */}
          <div className="absolute top-6 left-6 label-mono text-text-dim space-y-1 pointer-events-none">
            <div className="text-accent-pulse">NerveScope · live</div>
            <div>Segment / C7-T1</div>
            <div>σ = 0.0042 mm</div>
          </div>
          <div className="absolute top-6 right-6 label-mono text-text-dim text-right space-y-1 pointer-events-none">
            <div>Move cursor to rotate</div>
            <div>Scroll morphs cross-section</div>
          </div>
        </div>
      </section>

      {/* ── Paper highlight ─────────────────────────────── */}
      {highlightPub && (
        <AnimatedSection className="relative pt-28 pb-20 border-t border-border">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-pulse/40 to-transparent" />
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <MonoTag accent="pulse">Featured · 05</MonoTag>
                <h2 className="font-display text-5xl md:text-6xl tracking-[-0.02em] mt-4 leading-[0.95]">
                  Signal of <span className="italic text-text-secondary">the</span> month
                </h2>
                <p className="mt-6 text-sm text-text-muted leading-relaxed max-w-xs">
                  A recent paper our team is watching — not because it&apos;s ours,
                  but because it changes how we work.
                </p>
              </div>

              <div className="col-span-12 md:col-span-8 relative">
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
                    data-cursor="card"
                    data-cursor-label="Read ↗"
                    className="group block mt-4"
                  >
                    <h3 className="font-display text-2xl md:text-4xl leading-[1.1] tracking-[-0.01em] text-foreground group-hover:text-accent-pulse transition-colors duration-300">
                      {highlightPub.name}
                    </h3>
                  </a>
                  <div className="mt-6">
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
                    data-cursor="link"
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
            kicker="Publications · 06"
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
      <AnimatedSection className="relative py-32 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-8">
              <MonoTag accent="pulse">Join · 07</MonoTag>
              <h2
                className="font-display tracking-[-0.025em] leading-[0.9] mt-4 max-w-3xl"
                style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
              >
                Come work on
                <br />
                problems that
                <br />
                <span className="italic text-text-secondary">matter.</span>
              </h2>
              <p className="mt-8 text-text-secondary leading-relaxed max-w-xl">
                Research rotations for engineers, clinicians, and scientists.
                Joint grants with academic and industry partners. Access to one
                of the largest health systems in the country.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <Magnetic strength={0.4} radius={160}>
                <Link
                  href="/join"
                  data-cursor="link"
                  className="group inline-flex items-center gap-3 text-foreground"
                >
                  <span className="font-display text-3xl md:text-4xl link-underline pb-1">
                    Get in touch
                  </span>
                  <span
                    aria-hidden="true"
                    className="label-mono text-accent-pulse transform group-hover:translate-x-1 transition-transform duration-200"
                  >
                    →
                  </span>
                </Link>
              </Magnetic>
              <p className="mt-6 label-mono text-text-dim">
                tzanos@northwell.edu
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
