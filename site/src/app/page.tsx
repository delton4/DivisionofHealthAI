import Link from "next/link";
import Image from "next/image";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AccentLine } from "@/components/AccentLine";
import { LogoMark } from "@/components/LogoMark";
import { projects, publications, researchers } from "@/data";

export default function HomePage() {
  const featuredPubs = publications.slice(0, 4);
  const leader = researchers.find((r) => r.id === "1");

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-start justify-between gap-12">
            <div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-foreground">
                <span className="line-reveal"><span>Division of</span></span>
                <span className="line-reveal"><span>Health AI</span></span>
              </h1>
              <p className="hero-subtitle mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
                Machine learning for early diagnosis, deterioration prediction,
                and personalized therapeutics.
              </p>
              <AccentLine delay={600} />
            </div>
            <LogoMark size={120} className="hidden lg:block hero-subtitle shrink-0 mt-4" />
          </div>
          <div className="hero-links mt-8 flex flex-wrap gap-6 text-sm">
            <Link href="/research" className="text-accent hover:text-foreground transition-colors duration-200">
              Research →
            </Link>
            <Link href="/team" className="text-accent hover:text-foreground transition-colors duration-200">
              Team →
            </Link>
            <Link href="/publications" className="text-accent hover:text-foreground transition-colors duration-200">
              Publications →
            </Link>
            <Link href="/join" className="text-accent hover:text-foreground transition-colors duration-200">
              Join us →
            </Link>
          </div>
        </div>
      </section>

      {/* Research */}
      <AnimatedSection className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-3xl tracking-tight">Research</h2>
            <Link href="/research" className="text-sm text-text-muted hover:text-foreground transition-colors duration-200">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats line */}
      <AnimatedSection className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm text-text-muted">
            55 publications · 22 researchers · $9.8M NIH funding · 10,000+ citations
          </p>
        </div>
      </AnimatedSection>

      {/* Leadership */}
      {leader && (
        <AnimatedSection className="py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-3xl tracking-tight">Leadership</h2>
              <Link href="/team" className="text-sm text-text-muted hover:text-foreground transition-colors duration-200">
                Full team →
              </Link>
            </div>
            <Link
              href={`/team/${leader.slug}`}
              className="flex flex-col md:flex-row gap-6 md:gap-8 border border-border rounded-md p-6 md:p-8 hover:border-text-muted hover:bg-surface/50 transition-all duration-200 group"
            >
              <Image
                src="/zanos.jpg"
                alt="Dr. Theodoros P. Zanos"
                width={160}
                height={160}
                className="rounded-md object-cover w-32 h-32 md:w-40 md:h-40 shrink-0"
              />
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl group-hover:text-accent transition-colors duration-200">
                      Dr. Theodoros P. Zanos
                    </h3>
                    <p className="text-sm text-text-muted mt-1">
                      Head, Division of Health Artificial Intelligence
                    </p>
                  </div>
                  <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 mt-1">→</span>
                </div>
                <p className="text-sm text-text-secondary mt-3 leading-relaxed max-w-xl">
                  Associate Professor at the Feinstein Institutes and the Zucker School
                  of Medicine at Hofstra/Northwell. Over 50 peer-reviewed publications,
                  10,000+ citations. His lab predicts patient deterioration up to 17 hours
                  in advance.
                </p>
              </div>
            </Link>
          </div>
        </AnimatedSection>
      )}

      {/* Publications */}
      <AnimatedSection className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl tracking-tight">Selected Publications</h2>
            <Link href="/publications" className="text-sm text-text-muted hover:text-foreground transition-colors duration-200">
              View all →
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
      <AnimatedSection className="py-12 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-text-secondary">
            Interested in joining or collaborating?{" "}
            <Link href="/join" className="text-accent hover:text-foreground transition-colors duration-200">
              Get in touch →
            </Link>
          </p>
        </div>
      </AnimatedSection>
    </>
  );
}
