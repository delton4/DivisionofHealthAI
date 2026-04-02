import Link from "next/link";
import Image from "next/image";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AccentLine } from "@/components/AccentLine";
import { HeroLogo } from "@/components/HeroLogo";
import { projects, publications, researchers } from "@/data";

export default function HomePage() {
  const featuredPubs = publications.slice(0, 4);
  const leader = researchers.find((r) => r.id === "1");

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
              <p className="hero-subtitle mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
                Machine learning for early diagnosis, deterioration prediction,
                and personalized therapeutics.
              </p>
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
            {projects.slice(0, 5).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <p className="mt-10 text-sm text-text-muted">
            55 publications · 22 researchers · $9.8M NIH funding · 10,000+ citations
          </p>
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
            <Link
              href={`/team/${leader.slug}`}
              className="flex flex-col md:flex-row gap-6 md:gap-8 group"
            >
              <Image
                src="/zanos.jpg"
                alt="Dr. Theodoros P. Zanos"
                width={160}
                height={160}
                className="rounded-md object-cover w-32 h-32 md:w-40 md:h-40 shrink-0"
              />
              <div>
                <h3 className="font-display text-2xl group-hover:underline underline-offset-4 decoration-text-muted/40">
                  Dr. Theodoros P. Zanos
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Head, Division of Health Artificial Intelligence
                </p>
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
