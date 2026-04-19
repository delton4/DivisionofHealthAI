import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import { MonoTag } from "@/components/MonoTag";
import { getAllProjectsWithOverrides } from "@/data";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Research projects in clinical AI, bioelectronic medicine, neural engineering, computer vision, and health system science at Northwell Health.",
  alternates: { canonical: "/research" },
};
export const revalidate = 60;

export default async function ResearchPage() {
  const allProjects = await getAllProjectsWithOverrides();

  return (
    <>
      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <MonoTag accent="pulse">Research · Index</MonoTag>
          <div className="mt-4 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8">
              <h1 className="font-display text-[clamp(3rem,8vw,6rem)] tracking-[-0.02em] leading-[0.95]">
                <span className="italic text-text-secondary">Five</span> verticals,
                <br />
                one pipeline.
              </h1>
            </div>
            <div className="col-span-12 md:col-span-4">
              <p className="text-text-secondary leading-relaxed">
                From preclinical neural decoding to hospital-wide operational
                AI — our research spans the full translational pipeline, from
                bench to bedside to the hospital floor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection className="pb-24">
        <div>
          {allProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
          <div className="border-t border-border" />
        </div>
      </AnimatedSection>
    </>
  );
}
