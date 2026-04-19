import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { EditableText } from "@/components/EditableText";
import { MonoTag } from "@/components/MonoTag";
import { getPageOverrides } from "@/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Division of Health AI at Northwell Health develops machine learning systems for early diagnosis, deterioration prediction, and personalized therapeutics.",
  alternates: { canonical: "/about" },
};
export const revalidate = 60;

const defaults: Record<string, string> = {
  intro1:
    "The Division of Health AI at Northwell Health develops machine learning systems that directly improve patient outcomes. We operate at the intersection of artificial intelligence, computational neuroscience, and clinical medicine.",
  intro2:
    "Our work spans multiple healthcare data modalities: electronic health records, continuous physiological monitoring, medical imaging, and neural signal processing. Every algorithm we develop is designed not just to advance the science, but to be deployed in clinical settings where it makes a real difference in patient care.",
  approach1:
    "We combine the rigor of academic research with the urgency of clinical need. Our lab develops AI across five research verticals, each addressing a critical gap in how healthcare leverages data to improve outcomes, from predicting patient deterioration on the ward to decoding neural signals that unlock new therapies.",
  approach2: "We don't stop at publishing. We build, validate, and deploy.",
  achieve1_title: "Patient deterioration prediction",
  achieve1_desc:
    "Deep learning models trained on 1.5M+ hospitalizations predict deterioration up to 17 hours in advance, outperforming existing systems by 25%. Funded by a $3.2M NIH grant and published in Nature Communications.",
  achieve2_title: "COVID-19 clinical decision support",
  achieve2_desc:
    "AI tools analyzing data from 35,000+ patients to support clinical decisions during the pandemic, published in JAMA and Nature Communications.",
  achieve3_title: "Vagus nerve digital twin",
  achieve3_desc:
    "Processing 200TB of imaging data from 60 vagus nerves to create the most detailed digital twin in existence. Funded by a $6.7M NIH grant, using 3D nn-U-Net deep learning segmentation.",
  achieve4_title: "Workforce optimization",
  achieve4_desc:
    "DeepAR forecasting models predicting nursing demand 12 months ahead, estimated to save $10M annually across 10 hospital units.",
};

export default async function AboutPage() {
  const overrides = await getPageOverrides("about");
  const get = (key: string) => overrides[key] || defaults[key];

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6">
          <MonoTag accent="pulse">About · Div.HAI</MonoTag>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] tracking-[-0.02em] leading-[0.95]">
            <span className="italic text-text-secondary">What</span> we do.
          </h1>
        </div>
      </section>

      {/* Intro */}
      <AnimatedSection className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <MonoTag accent="dim">§ 01 · Overview</MonoTag>
            </div>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <EditableText
                entity="page"
                entityId="about"
                field="intro1"
                value={get("intro1")}
                multiline
                as="p"
                className="font-display text-2xl md:text-3xl text-foreground leading-[1.3] tracking-[-0.005em]"
              />
              <div className="mt-6">
                <EditableText
                  entity="page"
                  entityId="about"
                  field="intro2"
                  value={get("intro2")}
                  multiline
                  as="p"
                  className="text-text-secondary leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Approach */}
      <AnimatedSection className="py-20 border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <MonoTag accent="dim">§ 02 · Approach</MonoTag>
              <h2 className="font-display text-3xl tracking-[-0.015em] mt-4 leading-tight">
                How we <span className="italic text-text-secondary">work.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-9 max-w-3xl">
              <EditableText
                entity="page"
                entityId="about"
                field="approach1"
                value={get("approach1")}
                multiline
                as="p"
                className="text-lg text-foreground/90 leading-relaxed"
              />
              <div className="mt-5">
                <EditableText
                  entity="page"
                  entityId="about"
                  field="approach2"
                  value={get("approach2")}
                  multiline
                  as="p"
                  className="font-display text-2xl text-accent-pulse leading-snug"
                />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Achievements */}
      <AnimatedSection className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <MonoTag accent="dim">§ 03 · Outcomes</MonoTag>
              <h2 className="font-display text-3xl tracking-[-0.015em] mt-4 leading-tight">
                Selected milestones
              </h2>
            </div>
            <div className="col-span-12 md:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-background p-6 md:p-8 flex flex-col"
                  >
                    <MonoTag accent="pulse">
                      {String(n).padStart(2, "0")}
                    </MonoTag>
                    <EditableText
                      entity="page"
                      entityId="about"
                      field={`achieve${n}_title`}
                      value={get(`achieve${n}_title`)}
                      as="h3"
                      className="font-display text-xl md:text-2xl text-foreground tracking-[-0.01em] mt-3 leading-tight"
                    />
                    <div className="mt-3">
                      <EditableText
                        entity="page"
                        entityId="about"
                        field={`achieve${n}_desc`}
                        value={get(`achieve${n}_desc`)}
                        multiline
                        as="p"
                        className="text-sm text-text-secondary leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6 flex flex-wrap gap-6 items-center">
          <Link
            href="/research"
            className="group inline-flex items-center gap-2 font-display text-2xl link-underline pb-1"
          >
            Explore our research
            <span
              aria-hidden="true"
              className="label-mono text-accent-pulse transform group-hover:translate-x-1 transition-transform duration-200"
            >
              →
            </span>
          </Link>
          <span className="label-mono text-text-dim">·</span>
          <Link
            href="/join"
            className="label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200"
          >
            Or get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
