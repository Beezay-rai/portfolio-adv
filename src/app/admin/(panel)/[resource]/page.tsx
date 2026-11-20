import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getResource } from "@/config/resources";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Row } from "@/types/database";

function display(v: unknown) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return formatDate(v);
  return v == null || v === "" ? "–" : String(v);
}

export default async function ListPage({ params }: { params: Promise<{ resource: string }> }) {
  const resource = getResource((await params).resource);
  if (!resource) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.orderBy, { ascending: resource.ascending ?? false });
  const rows = (data ?? []) as Row[];
  const titleCol = resource.columns[0];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">{resource.label}</h1>
          <p className="mt-1 text-ink-soft">Manage your {resource.label.toLowerCase()}</p>
        </div>
        <Link href={`/admin/${resource.key}/new`} className="btn w-full sm:w-auto">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {resource.singular}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-16 animate-slide-up">
          <svg className="mx-auto h-12 w-12 text-ink-faint mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg text-ink-soft mb-4">No {resource.label.toLowerCase()} yet</p>
          <Link href={`/admin/${resource.key}/new`} className="btn inline-flex">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add your first {resource.singular}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line/50 text-ink-soft">
                  {resource.columns.map((c) => (
                    <th key={c} className="px-6 py-4 font-medium text-sm uppercase tracking-wider text-ink-faint">
                      {resource.fields.find((f) => f.name === c)?.label ?? c}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-paper-lighter transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {resource.columns.map((c) => (
                      <td key={c} className="px-6 py-4">
                        <span className="text-sm text-ink">{display(row[c])}</span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/${resource.key}/${row.id}`}
                          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <DeleteButton resource={resource.key} id={row.id} label={String(row[titleCol])} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
