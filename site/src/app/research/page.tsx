import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return (
    <>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Research</h1>
          <div className="mt-3 w-12 h-0.5 bg-accent-warm" />
          <p className="mt-6 text-text-secondary max-w-2xl leading-relaxed">
            Five interconnected verticals spanning the full translational
            pipeline — from preclinical neural decoding to hospital-wide
            operational AI.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-2">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
