import Link from "next/link";
import Image from "next/image";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AccentLine } from "@/components/AccentLine";
import { HeroLogo } from "@/components/HeroLogo";
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

  const featuredPubs = allPubs.slice(0, 4);
  const leader = allResearchers.find((r) => r.id === "1");

  const heroSubtitle = pageOverrides.subtitle ||
    "Machine learning for early diagnosis, deterioration prediction, and personalized therapeutics.";

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-start justify-between gap-12">
            <div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-foreground">
                <span className="line-reveal"><span>Division of</span></span>
                <span className="line-reveal"><span>Health AI</span></span>
              </h1>
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
            <HeroLogo size={280} className="hidden lg:block shrink-0 -mt-4" />
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

      {/* Leadership */}
      {leader && (
        <AnimatedSection className="pt-20 pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-3xl tracking-tight">Leadership</h2>
              <Link href="/team" className="text-xs text-text-muted hover:text-text-secondary transition-colors duration-200">
                Full team
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <Link href={`/team/${leader.slug}`}>
                <Image
                  src="/zanos.jpg"
                  alt="Dr. Theodoros P. Zanos"
                  width={160}
                  height={160}
                  className="rounded-md object-cover w-32 h-32 md:w-40 md:h-40 shrink-0"
                />
              </Link>
              <div>
                <Link href={`/team/${leader.slug}`} className="group">
                  <h3 className="font-display text-2xl group-hover:underline underline-offset-4 decoration-text-muted/40">
                    Dr. Theodoros P. Zanos
                  </h3>
                </Link>
                <EditableText
                  entity="researcher"
                  entityId={leader.id}
                  field="title"
                  value={leader.title}
                  as="p"
                  className="text-sm text-text-muted mt-1"
                />
                <EditableText
                  entity="researcher"
                  entityId={leader.id}
                  field="about"
                  value={leader.about.length > 300 ? leader.about.slice(0, 300) + "..." : leader.about}
                  multiline
                  as="p"
                  className="text-sm text-text-secondary mt-3 leading-relaxed max-w-xl"
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
