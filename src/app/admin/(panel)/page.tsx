import Link from "next/link";
import { resources } from "@/config/resources";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const counts = await Promise.all(
    resources.map(async (r) => {
      const { count } = await supabase.from(r.table).select("*", { count: "exact", head: true });
      return { ...r, count: count ?? 0 };
    }),
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
        <div className="text-sm text-ink-faint">
          Welcome back! Manage your portfolio content.
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {counts.map((r) => (
          <Link
            key={r.key}
            href={`/admin/${r.key}`}
            className="admin-card group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-ink group-hover:text-accent transition-colors">{r.count}</p>
                <p className="mt-1 text-ink-soft">{r.label}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}

        {/* Quick Actions */}
        <Link href="/admin/settings" className="admin-card group flex flex-col items-center justify-center text-center min-h-[150px]">
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors mb-4">
            <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-medium text-ink">Site Settings</p>
          <p className="text-sm text-ink-soft mt-1">Customize your portfolio</p>
        </Link>
      </div>
    </div>
  );
}
