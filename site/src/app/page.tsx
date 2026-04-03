import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AccentLine } from "@/components/AccentLine";
import { HeroLogo } from "@/components/HeroLogo";
import { EditableText } from "@/components/EditableText";
import {
  getAllProjectsWithOverrides,
  getAllPublicationsWithOverrides,
  getPageOverrides,
} from "@/data";

export const revalidate = 60;

export default async function HomePage() {
  const [allProjects, allPubs, pageOverrides] = await Promise.all([
    getAllProjectsWithOverrides(),
    getAllPublicationsWithOverrides(),
    getPageOverrides("home"),
  ]);

  const featuredPubs = allPubs.slice(0, 4);
  const highlightPubId = pageOverrides.highlight_pub_id || "2";
  const highlightPub = allPubs.find((p) => p.id === highlightPubId);

  const heroSubtitle = pageOverrides.subtitle ||
    "Machine learning for early diagnosis, deterioration prediction, and personalized therapeutics.";

  const highlightDesc = pageOverrides.highlight_desc ||
    "A wearable-based deep learning model that identifies the onset of clinical deterioration earlier than traditional early warning systems, predicting adverse outcomes up to 17 hours in advance with over 81% accuracy.";

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-start justify-between gap-8 md:gap-12">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-foreground">
                <span className="line-reveal"><span>Division of</span></span>
                <span className="line-reveal"><span>Health AI</span></span>
              </h1>
              <p className="font-display text-2xl md:text-3xl tracking-tight text-text-secondary mt-2 line-reveal">
                <span>Northwell Health</span>
              </p>
              <div className="hero-subtitle mt-6 max-w-lg">
                <EditableText
                  entity="page"
                  entityId="home"
                  field="subtitle"
                  value={heroSubtitle}
                  multiline
                  as="p"
                  className="text-lg text-text-secondary leading-relaxed"
                />
              </div>
              <AccentLine delay={600} />
            </div>
            <div className="flex items-center justify-center shrink-0 w-24 md:w-48 lg:w-72 -mt-4">
              <HeroLogo className="w-full h-auto" />
            </div>
          </div>
          <nav className="hero-links mt-8 flex flex-wrap gap-6 text-sm">
            <Link href="/research" className="text-text-secondary hover:text-foreground transition-colors duration-200">
              Research
            </Link>
            <Link href="/team" className="text-text-secondary hover:text-foreground transition-colors duration-200">
              Team
            </Link>
            <Link href="/publications" className="text-text-secondary hover:text-foreground transition-colors duration-200">
              Publications
            </Link>
            <Link href="/join" className="text-text-secondary hover:text-foreground transition-colors duration-200">
              Join us
            </Link>
          </nav>
        </div>
      </section>

      {/* Research */}
      <AnimatedSection className="py-14 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl tracking-tight">Research</h2>
            <Link href="/research" className="text-xs text-text-muted hover:text-text-secondary transition-colors duration-200">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {allProjects.slice(0, 5).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Paper Highlight */}
      {highlightPub && (
        <AnimatedSection className="pt-20 pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-3xl tracking-tight mb-8">Paper Highlight</h2>
            <div className="max-w-3xl">
              <a
                href={highlightPub.publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <span className="text-xs italic text-text-muted">
                  {highlightPub.journal}
                </span>
                <h3 className="font-display text-xl md:text-2xl mt-1 group-hover:underline underline-offset-4 decoration-text-muted/40">
                  {highlightPub.name}
                </h3>
              </a>
              <div className="mt-3">
                <EditableText
                  entity="page"
                  entityId="home"
                  field="highlight_desc"
                  value={highlightDesc}
                  multiline
                  as="p"
                  className="text-sm text-text-secondary leading-relaxed"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Publications */}
      <AnimatedSection className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl tracking-tight">Selected Publications</h2>
            <Link href="/publications" className="text-xs text-text-muted hover:text-text-secondary transition-colors duration-200">
              View all
            </Link>
          </div>
          <div>
            {featuredPubs.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Join */}
      <AnimatedSection className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-text-secondary">
            Interested in joining or collaborating?{" "}
            <Link href="/join" className="underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200">
              Get in touch
            </Link>
          </p>
        </div>
      </AnimatedSection>
    </>
  );
}
