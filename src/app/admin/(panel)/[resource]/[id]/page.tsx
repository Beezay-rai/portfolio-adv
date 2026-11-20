import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getResource } from "@/config/resources";
import { createClient } from "@/lib/supabase/server";
import type { Row } from "@/types/database";

export default async function EditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Edit {resource.singular}</h1>
        <p className="mt-1 text-ink-soft">Update the details below</p>
      </div>
      <ResourceForm resource={resource} item={data as Row} />
    </div>
  );
}
