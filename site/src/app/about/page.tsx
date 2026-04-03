import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { EditableText } from "@/components/EditableText";
import { getPageOverrides } from "@/data";

export const metadata: Metadata = {
  title: "About",
  description: "The Division of Health AI at Northwell Health develops machine learning systems for early diagnosis, deterioration prediction, and personalized therapeutics.",
  alternates: { canonical: "/about" },
};
export const revalidate = 60;

const defaults: Record<string, string> = {
  intro1: "The Division of Health AI at Northwell Health develops machine learning systems that directly improve patient outcomes. We operate at the intersection of artificial intelligence, computational neuroscience, and clinical medicine.",
  intro2: "Our work spans multiple healthcare data modalities: electronic health records, continuous physiological monitoring, medical imaging, and neural signal processing. Every algorithm we develop is designed not just to advance the science, but to be deployed in clinical settings where it makes a real difference in patient care.",
  approach1: "We combine the rigor of academic research with the urgency of clinical need. Our lab develops AI across five research verticals, each addressing a critical gap in how healthcare leverages data to improve outcomes, from predicting patient deterioration on the ward to decoding neural signals that unlock new therapies.",
  approach2: "We don't stop at publishing. We build, validate, and deploy.",
  achieve1_title: "Patient deterioration prediction",
  achieve1_desc: "Deep learning models trained on 1.5M+ hospitalizations predict deterioration up to 17 hours in advance, outperforming existing systems by 25%. Funded by a $3.2M NIH grant and published in Nature Communications.",
  achieve2_title: "COVID-19 clinical decision support",
  achieve2_desc: "AI tools analyzing data from 35,000+ patients to support clinical decisions during the pandemic, published in JAMA and Nature Communications.",
  achieve3_title: "Vagus nerve digital twin",
  achieve3_desc: "Processing 200TB of imaging data from 60 vagus nerves to create the most detailed digital twin in existence. Funded by a $6.7M NIH grant, using 3D nn-U-Net deep learning segmentation.",
  achieve4_title: "Workforce optimization",
  achieve4_desc: "DeepAR forecasting models predicting nursing demand 12 months ahead, estimated to save $10M annually across 10 hospital units.",
};

export default async function AboutPage() {
  const overrides = await getPageOverrides("about");
  const get = (key: string) => overrides[key] || defaults[key];

  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">About</h1>
        </div>
      </section>

      <AnimatedSection className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <EditableText entity="page" entityId="about" field="intro1" value={get("intro1")} multiline as="p" className="text-lg text-text-secondary leading-relaxed" />
            <div className="mt-4">
              <EditableText entity="page" entityId="about" field="intro2" value={get("intro2")} multiline as="p" className="text-text-secondary leading-relaxed" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl tracking-tight mb-8">Our Approach</h2>
          <div className="max-w-3xl">
            <EditableText entity="page" entityId="about" field="approach1" value={get("approach1")} multiline as="p" className="text-text-secondary leading-relaxed" />
            <div className="mt-4">
              <EditableText entity="page" entityId="about" field="approach2" value={get("approach2")} multiline as="p" className="text-text-secondary leading-relaxed" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="pt-20 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl tracking-tight mb-8">Key Achievements</h2>
          <div className="max-w-3xl space-y-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <EditableText entity="page" entityId="about" field={`achieve${n}_title`} value={get(`achieve${n}_title`)} as="h3" className="font-medium text-foreground" />
                <div className="mt-1">
                  <EditableText entity="page" entityId="about" field={`achieve${n}_desc`} value={get(`achieve${n}_desc`)} multiline as="p" className="text-sm text-text-secondary leading-relaxed" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <section className="py-12 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-text-secondary">
            <Link href="/research" className="underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200">
              Explore our research
            </Link>
            {" · "}
            <Link href="/join" className="underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200">
              Get in touch
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
