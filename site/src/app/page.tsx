import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { PublicationCard } from "@/components/PublicationCard";
import { projects, publications, researchers } from "@/data";

export default function HomePage() {
  const featuredPubs = publications.slice(0, 6);
  const leader = researchers.find((r) => r.id === "1");

  return (
    <>
      {/* Opening */}
      <section className="pt-36 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] text-foreground">
            Division of
            <br />
            Health AI
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
            We develop machine learning systems for early disease diagnosis,
            patient deterioration prediction, and personalized therapeutics at
            the Feinstein Institutes for Medical Research.
          </p>
          <div className="mt-3 w-12 h-0.5 bg-accent-warm" />
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
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

      {/* Research Verticals */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-display text-3xl tracking-tight">Research</h2>
            <Link
              href="/research"
              className="text-sm text-text-muted hover:text-foreground transition-colors duration-200"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
          <p className="mt-12 text-sm text-text-secondary leading-relaxed">
            55 publications across 22 researchers, funded by $9.8M in NIH grants,
            accumulating over 10,000 citations in journals including Nature
            Communications, PNAS, JAMA, and Nature Machine Intelligence.
          </p>
        </div>
      </section>

      {/* Selected Publications */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl tracking-tight">
              Selected Publications
            </h2>
            <Link
              href="/publications"
              className="text-sm text-text-muted hover:text-foreground transition-colors duration-200"
            >
              View all →
            </Link>
          </div>
          <div>
            {featuredPubs.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
          <div className="mt-6 md:hidden">
            <Link
              href="/publications"
              className="text-sm text-text-muted hover:text-foreground transition-colors duration-200"
            >
              View all publications →
            </Link>
          </div>
        </div>
      </section>

      {/* Leadership */}
      {leader && (
        <section className="py-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-3xl tracking-tight">Leadership</h2>
              <Link
                href="/team"
                className="text-sm text-text-muted hover:text-foreground transition-colors duration-200"
              >
                Full team →
              </Link>
            </div>
            <Link
              href={`/team/${leader.slug}`}
              className="block max-w-3xl border border-border rounded-md p-6 md:p-8 hover:border-text-muted hover:bg-surface/50 transition-all duration-200 group"
            >
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
              <p className="text-text-secondary mt-4 leading-relaxed text-sm md:text-base">
                Associate Professor at the Feinstein Institutes for Medical Research
                and the Zucker School of Medicine at Hofstra/Northwell. His research
                sits at the intersection of artificial intelligence, computational
                neuroscience, and clinical medicine, with over 50 peer-reviewed
                publications accumulating over 10,000 citations.
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Join */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-text-secondary">
            Interested in joining or collaborating?{" "}
            <Link
              href="/join"
              className="text-accent hover:text-foreground transition-colors duration-200"
            >
              Get in touch →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
