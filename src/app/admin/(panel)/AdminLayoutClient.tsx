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
      <div className="md:hidden flex items-center justify-between border-b border-line bg-white px-6 py-4 sticky top-0 z-40">
        <Link href="/admin" className="font-display text-xl font-semibold text-ink">
          Admin Panel
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
        className={`fixed md:sticky top-0 h-screen z-40 w-64 shrink-0 border-r border-line bg-white p-6 transition-transform duration-300 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="hidden md:block mb-8">
            <Link href="/admin" className="font-display text-xl font-semibold text-ink">
              Content Manager
            </Link>
          </div>

          <nav aria-label="Admin" className="mt-4 md:mt-0">
            <ul className="space-y-1 text-sm">
              
              {resources.map((r) => {
                const isActive = pathname.startsWith(`/admin/${r.key}`);
                return (
                  <li key={r.key}>
                    <Link
                      href={`/admin/${r.key}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded px-3 py-2 transition-all duration-200 font-medium ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-ink/5 text-ink-soft hover:text-ink"
                      }`}
                    >
                      {r.label}
                    </Link>
                  </li>
                );
              })}
                <li>
              <Link href="/admin/anime" className="block rounded px-2 py-1.5 hover:bg-ink/5">Anime tracker</Link>
            </li>
              <li>
                <Link
                  href="/admin/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`block rounded px-3 py-2 transition-all duration-200 font-medium ${
                    pathname.startsWith("/admin/settings")
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-ink/5 text-ink-soft hover:text-ink"
                  }`}
                >
                  Site Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="space-y-3 border-t border-line pt-6 text-sm">
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