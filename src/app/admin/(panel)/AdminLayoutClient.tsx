"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  resources: Array<{ key: string; label: string }>;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function AdminLayoutClient({ resources, logoutAction, children }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-paper-light flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-line bg-white/90 px-6 py-4 sticky top-0 z-40 backdrop-blur">
        <Link href="/admin" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-ink text-sm text-white shadow-sm">C</span>
          Content Manager
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-ink hover:bg-ink/5 transition-colors"
          aria-label="Toggle admin menu"
        >
          {sidebarOpen ? (
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-64 shrink-0 border-r border-line bg-gradient-to-b from-white via-white to-accent/5 p-6 shadow-sm transition-transform duration-300 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="hidden md:block mb-8">
            <Link href="/admin" className="flex items-center gap-3 font-display text-xl font-semibold text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-ink text-lg text-white shadow-md">C</span>
              <span>
                <span className="block">Content Manager</span>
                <span className="mt-0.5 block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">Workspace</span>
              </span>
            </Link>
          </div>

          <nav aria-label="Admin" className="mt-4 md:mt-0">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">Manage</p>
            <ul className="space-y-1.5 text-sm">
              {resources.map((r) => {
                const isActive = pathname.startsWith(`/admin/${r.key}`);
                return (
                  <li key={r.key}>
                    <Link
                      href={`/admin/${r.key}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative block rounded-lg px-3 py-2.5 transition-all duration-200 font-medium ${
                        isActive
                          ? "bg-accent/10 text-accent shadow-sm before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-r-full before:bg-accent"
                          : "text-ink-soft hover:bg-white/80 hover:text-ink"
                      }`}
                    >
                      {r.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/admin/anime"
                  onClick={() => setSidebarOpen(false)}
                  className={`relative block rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                    pathname.startsWith("/admin/anime")
                      ? "bg-accent/10 text-accent shadow-sm before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-r-full before:bg-accent"
                      : "text-ink-soft hover:bg-white/80 hover:text-ink"
                  }`}
                >
                  Anime tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`relative block rounded-lg px-3 py-2.5 transition-all duration-200 font-medium ${
                    pathname.startsWith("/admin/settings")
                    ? "bg-accent/10 text-accent shadow-sm before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-r-full before:bg-accent"
                    : "text-ink-soft hover:bg-white/80 hover:text-ink"
                  }`}
                >
                  Site Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/mfa"
                  onClick={() => setSidebarOpen(false)}
                  className={`relative block rounded-lg px-3 py-2.5 transition-all duration-200 font-medium ${
                    pathname === "/admin/mfa"
                      ? "bg-accent/10 text-accent shadow-sm before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-r-full before:bg-accent"
                      : "text-ink-soft hover:bg-white/80 hover:text-ink"
                  }`}
                >
                  MFA Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="space-y-3 rounded-xl border border-line/70 bg-white/70 p-3 text-sm shadow-sm">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-ink-soft hover:text-red-600 transition-colors w-full text-left"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}