"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#education", label: "Education" },
  { href: "/blog", label: "Blog" },
];

export function MobileNav({ siteName }: { siteName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-semibold text-ink hover:text-accent transition-colors">
            {siteName}
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex gap-6 text-sm text-ink-soft">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="relative font-medium hover:text-ink after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-ink hover:bg-ink/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <nav aria-label="Mobile" className="md:hidden border-t border-line/50 bg-white px-6 py-4 animate-slide-up">
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-base font-medium text-ink hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}