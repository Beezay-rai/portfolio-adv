import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { getResource } from "@/config/resources";

export default async function NewPage({ params }: { params: Promise<{ resource: string }> }) {
  const resource = getResource((await params).resource);
  if (!resource) notFound();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Add {resource.singular}</h1>
        <p className="mt-1 text-ink-soft">Fill in the details below</p>
      </div>
      <ResourceForm resource={resource} />
    </div>
  );
}
