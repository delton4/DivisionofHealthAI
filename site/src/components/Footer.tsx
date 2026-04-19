import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { MonoTag } from "@/components/MonoTag";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40 mt-auto">
      <div className="bg-grid">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          {/* Top row: big wordmark */}
          <div className="grid grid-cols-12 gap-6 pb-12 border-b border-border">
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-4 mb-5">
                <LogoMark size={32} />
                <div>
                  <MonoTag accent="dim">Est. 2018 · Manhasset, NY</MonoTag>
                </div>
              </div>
              <h3 className="font-display tracking-[-0.02em] leading-[0.95] text-[clamp(2rem,5vw,3.5rem)]">
                Division of <span className="italic text-text-secondary">Health</span> AI
              </h3>
              <p className="mt-4 text-text-secondary max-w-md leading-relaxed">
                A research arm of Northwell Health and the Feinstein Institutes
                for Medical Research. We build clinical AI that ships.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-6 md:pt-4">
              <div>
                <MonoTag accent="dim">Explore</MonoTag>
                <ul className="mt-3 space-y-2">
                  {[
                    { href: "/about", label: "About" },
                    { href: "/team", label: "Team" },
                    { href: "/research", label: "Research" },
                    { href: "/publications", label: "Publications" },
                    { href: "/join", label: "Join Us" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <MonoTag accent="dim">Affiliations</MonoTag>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="https://feinstein.northwell.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200"
                    >
                      Feinstein Institutes ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.northwell.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200"
                    >
                      Northwell Health ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:tzanos@northwell.edu"
                      className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200"
                    >
                      tzanos@northwell.edu
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coordinate row */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <MonoTag accent="dim">Location</MonoTag>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                350 Community Drive<br />
                Manhasset, NY 11030<br />
                <span className="text-text-muted">41.0325° N, 73.7001° W</span>
              </p>
            </div>
            <div>
              <MonoTag accent="dim">Status</MonoTag>
              <div className="mt-2 flex items-center gap-2">
                <span className="status-pulse" />
                <p className="text-sm text-text-secondary">
                  Systems nominal · all deployments healthy
                </p>
              </div>
            </div>
            <div>
              <MonoTag accent="dim">Focus areas</MonoTag>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Clinical AI · Bioelectronic medicine · Imaging · Health systems
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <p className="label-mono text-text-dim">
              © {new Date().getFullYear()} Division of Health AI — Northwell Health
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="/admin/login"
                className="label-mono text-text-dim hover:text-text-muted transition-colors duration-200"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
