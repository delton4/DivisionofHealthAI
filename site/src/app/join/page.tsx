import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { EditableText } from "@/components/EditableText";
import { getPageOverrides } from "@/data";

export const metadata: Metadata = {
  title: "Join Us",
  description: "Join the Division of Health AI at Northwell Health. Open positions for researchers, engineers, clinicians, and research scholars.",
  alternates: { canonical: "/join" },
};
export const revalidate = 60;

const defaults: Record<string, string> = {
  intro: "We're looking for talented researchers, engineers, and clinicians who want to make a real impact on patient care through artificial intelligence.",
  scholar_desc: "Join our lab for a research rotation. Work alongside our team on active projects, gain hands-on experience with clinical AI development, and contribute to publications.",
  collab_desc: "Partner with us on joint research projects. We collaborate with academic institutions, healthcare systems, and industry partners to advance health AI.",
  location_desc: "Northwell Health, one of the largest healthcare systems in the US and home to the Feinstein Institutes for Medical Research.",
};

export default async function JoinPage() {
  const overrides = await getPageOverrides("join");
  const get = (key: string) => overrides[key] || defaults[key];

  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Join Us</h1>
          <div className="mt-6 max-w-2xl">
            <EditableText entity="page" entityId="join" field="intro" value={get("intro")} multiline as="p" className="text-lg text-text-secondary leading-relaxed" />
          </div>
        </div>
      </section>

      <AnimatedSection className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl tracking-tight">Visiting Scholar Program</h2>
            <div className="mt-4">
              <EditableText entity="page" entityId="join" field="scholar_desc" value={get("scholar_desc")} multiline as="p" className="text-text-secondary leading-relaxed" />
            </div>
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
            <div className="mt-4">
              <EditableText entity="page" entityId="join" field="collab_desc" value={get("collab_desc")} multiline as="p" className="text-text-secondary leading-relaxed" />
            </div>
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
            <div className="mt-4">
              <EditableText entity="page" entityId="join" field="location_desc" value={get("location_desc")} multiline as="p" className="text-text-secondary leading-relaxed" />
            </div>
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
