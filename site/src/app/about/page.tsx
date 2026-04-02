import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
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
            <p className="text-lg text-text-secondary leading-relaxed">
              The Division of Health AI at the Feinstein Institutes develops
              machine learning systems that directly improve patient outcomes.
              We operate at the intersection of artificial intelligence,
              computational neuroscience, and clinical medicine.
            </p>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Our work spans multiple healthcare data modalities: electronic
              health records, continuous physiological monitoring, medical imaging,
              and neural signal processing. Every algorithm we develop is designed
              not just to advance the science, but to be deployed in clinical
              settings where it makes a real difference in patient care.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl tracking-tight mb-8">Our Approach</h2>
          <div className="max-w-3xl">
            <p className="text-text-secondary leading-relaxed">
              We combine the rigor of academic research with the urgency of
              clinical need. Our lab develops AI across five research verticals,
              each addressing a critical gap in how healthcare leverages data to
              improve outcomes, from predicting patient deterioration on the ward
              to decoding neural signals that unlock new therapies.
            </p>
            <p className="mt-4 text-text-secondary leading-relaxed">
              We don&apos;t stop at publishing. We build, validate, and deploy.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="pt-20 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl tracking-tight mb-8">Key Achievements</h2>
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="font-medium text-foreground">Patient deterioration prediction</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Deep learning models trained on 1.5M+ hospitalizations predict
                deterioration up to 17 hours in advance, outperforming existing
                systems by 25%. Funded by a $3.2M NIH grant and published in
                Nature Communications.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">COVID-19 clinical decision support</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                AI tools analyzing data from 35,000+ patients to support clinical
                decisions during the pandemic, published in JAMA and Nature
                Communications.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Vagus nerve digital twin</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Processing 200TB of imaging data from 60 vagus nerves to create
                the most detailed digital twin in existence. Funded by a $6.7M
                NIH grant, using 3D nn-U-Net deep learning segmentation.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Workforce optimization</h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                DeepAR forecasting models predicting nursing demand 12 months
                ahead, estimated to save $10M annually across 10 hospital units.
              </p>
            </div>
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
