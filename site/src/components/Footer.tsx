import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LogoMark size={24} />
              <span className="font-display text-lg text-foreground">
                Division of Health AI
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1 max-w-sm">
              Feinstein Institutes for Medical Research, Northwell Health
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/about", label: "About" },
                  { href: "/team", label: "Team" },
                  { href: "/research", label: "Research" },
                  { href: "/publications", label: "Publications" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-muted hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/join"
                    className="text-text-muted hover:text-foreground transition-colors duration-200"
                  >
                    Join Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://feinstein.northwell.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-foreground transition-colors duration-200"
                  >
                    Feinstein Institutes
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.northwell.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-foreground transition-colors duration-200"
                  >
                    Northwell Health
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Division of Health AI, Feinstein
            Institutes for Medical Research
          </p>
        </div>
      </div>
    </footer>
  );
}
