import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Research</h1>
          <p className="mt-6 text-text-secondary max-w-2xl leading-relaxed">
            Five interconnected verticals spanning the full translational
            pipeline, from preclinical neural decoding to hospital-wide
            operational AI.
          </p>
        </div>
      </section>

      <AnimatedSection className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
