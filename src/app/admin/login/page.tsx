"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="mx-auto mt-16 md:mt-24 max-w-sm px-6 animate-fade-in">
      <div className="card">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-ink-soft">Manage your portfolio content.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input pl-10"
                placeholder="you@example.com"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input pl-10"
                placeholder="••••••••"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
              {state.error}
            </div>
          )}
          <button
            disabled={pending}
            className="btn w-full justify-center disabled:opacity-60 mt-2"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-line/50 text-center">
          <p className="text-sm text-ink-soft">
            Don't have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
