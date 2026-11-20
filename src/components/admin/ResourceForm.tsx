import Link from "next/link";
import { saveResource } from "@/actions/resource";
import type { Resource } from "@/config/resources";
import type { Row } from "@/types/database";
import { FieldInput } from "./FieldInput";

export function ResourceForm({ resource, item }: { resource: Resource; item?: Row }) {
  return (
    <form action={saveResource} className="max-w-2xl space-y-6 animate-fade-in">
      <input type="hidden" name="__resource" value={resource.key} />
      {item && <input type="hidden" name="__id" value={item.id} />}
      {typeof item?.published_at === "string" && <input type="hidden" name="__published_at" value={item.published_at} />}

      <div className="space-y-6">
        {resource.fields.map((f) => (
          <FieldInput key={f.name} field={f} value={item?.[f.name]} folder={resource.key} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-6 border-t border-line/50">
        <button className="btn" type="submit">
          {item ? "Save changes" : "Create"}
        </button>
        <Link href={`/admin/${resource.key}`} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
