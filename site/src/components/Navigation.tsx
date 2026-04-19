"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";
import { useAdmin } from "@/components/AdminProvider";
import { logout } from "@/lib/actions";

const links = [
  { href: "/about", label: "About", code: "A" },
  { href: "/team", label: "Team", code: "T" },
  { href: "/research", label: "Research", code: "R" },
  { href: "/publications", label: "Publications", code: "P" },
  { href: "/join", label: "Join", code: "J" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = useAdmin();
  const pathname = usePathname();

  useEffect(() => {
    const handlePopState = () => setIsOpen(false);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Top meta strip (hidden when scrolled) */}
      <div
        className={`hidden md:block overflow-hidden transition-all duration-300 border-b border-border/40 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 h-8 flex items-center justify-between label-mono text-text-dim">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="status-pulse" />
              <span className="text-text-muted">System nominal</span>
            </span>
            <span>Manhasset · Feinstein Institutes · Floor 3</span>
          </div>
          <div className="flex items-center gap-5">
            <span>dhai.northwell</span>
            <span className="hidden lg:inline">Ver. 2026.04</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <LogoMark size={24} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[15px] tracking-tight text-foreground">
                Division of Health AI
              </span>
              <span className="label-mono text-text-dim mt-0.5">
                Northwell · Feinstein
              </span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`group relative flex items-center gap-1.5 text-sm transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                <span
                  className={`label-mono transition-colors duration-200 ${
                    isActive(link.href) ? "text-accent-pulse" : "text-text-dim"
                  } group-hover:text-accent-pulse`}
                >
                  {link.code}
                </span>
                <span>{link.label}</span>
                {isActive(link.href) && (
                  <span className="absolute -bottom-[18px] left-0 right-0 h-px bg-accent-pulse" />
                )}
              </Link>
            ))}
            {isAdmin && (
              <span className="flex items-center gap-3 pl-4 ml-2 border-l border-border">
                <Link
                  href="/admin/team"
                  className="label-mono text-text-muted hover:text-accent transition-colors duration-200"
                >
                  Adm·T
                </Link>
                <Link
                  href="/admin/research"
                  className="label-mono text-text-muted hover:text-accent transition-colors duration-200"
                >
                  Adm·R
                </Link>
                <Link
                  href="/admin/publications"
                  className="label-mono text-text-muted hover:text-accent transition-colors duration-200"
                >
                  Adm·P
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="label-mono text-text-muted hover:text-accent-warm transition-colors duration-200"
                  >
                    Out
                  </button>
                </form>
              </span>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-foreground"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 py-3 text-sm text-text-secondary hover:text-foreground transition-colors duration-200"
            >
              <span className="label-mono text-text-dim w-4">{link.code}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-border space-y-1">
              <Link href="/admin/team" onClick={() => setIsOpen(false)} className="block py-2 label-mono text-text-muted hover:text-accent transition-colors duration-200">
                Admin · Team
              </Link>
              <Link href="/admin/research" onClick={() => setIsOpen(false)} className="block py-2 label-mono text-text-muted hover:text-accent transition-colors duration-200">
                Admin · Research
              </Link>
              <Link href="/admin/publications" onClick={() => setIsOpen(false)} className="block py-2 label-mono text-text-muted hover:text-accent transition-colors duration-200">
                Admin · Pubs
              </Link>
              <form action={logout}>
                <button type="submit" className="block py-2 label-mono text-text-muted hover:text-accent-warm transition-colors duration-200">
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
