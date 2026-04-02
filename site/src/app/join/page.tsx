import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
  title: "Join Us",
};

export default function JoinPage() {
  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Join Us</h1>
          <p className="mt-6 text-lg text-text-secondary max-w-2xl leading-relaxed">
            We&apos;re looking for talented researchers, engineers, and clinicians
            who want to make a real impact on patient care through artificial
            intelligence.
          </p>
        </div>
      </section>

      <AnimatedSection className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl tracking-tight">Visiting Scholar Program</h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Join our lab for a research rotation. Work alongside our team on
              active projects, gain hands-on experience with clinical AI
              development, and contribute to publications.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
              <li>· 3 to 12 month research rotations</li>
              <li>· Access to clinical datasets and computing resources</li>
              <li>· Mentorship from senior researchers</li>
              <li>· Publication opportunities</li>
            </ul>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl tracking-tight">Research Collaboration</h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Partner with us on joint research projects. We collaborate with
              academic institutions, healthcare systems, and industry partners
              to advance health AI.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
              <li>· Joint grant applications</li>
              <li>· Shared datasets and infrastructure</li>
              <li>· Co-authored publications</li>
              <li>· Technology transfer opportunities</li>
            </ul>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="pt-20 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl tracking-tight">Where We Work</h2>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Feinstein Institutes for Medical Research, Northwell Health&apos;s
              research arm and one of the largest biomedical research organizations
              in the US.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              350 Community Drive, Manhasset, NY 11030
            </p>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-text-secondary">
                Interested?{" "}
                <a
                  href="mailto:tzanos@northwell.edu"
                  className="underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200"
                >
                  Reach out to us
                </a>
              </p>
              <p className="mt-2 text-sm text-text-muted">
                <Link
                  href="/team"
                  className="hover:text-text-secondary transition-colors duration-200"
                >
                  Meet the current team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
