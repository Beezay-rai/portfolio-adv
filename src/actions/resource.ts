"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getResource } from "@/config/resources";
import { requireUser } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export async function saveResource(formData: FormData) {
  const supabase = await requireUser();
  const resource = getResource(String(formData.get("__resource")));
  if (!resource) throw new Error("Unknown resource");
  const id = formData.get("__id") as string | null;

  const payload: Record<string, unknown> = {};
  for (const f of resource.fields) {
    const raw = formData.get(f.name);
    switch (f.type) {
      case "checkbox":
        payload[f.name] = raw === "on";
        break;
      case "tags":
        payload[f.name] = String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "number":
        payload[f.name] = raw ? Number(raw) : 0;
        break;
      case "image": {
        const file = formData.get(`${f.name}__file`);
        let url: string | null = String(raw ?? "") || null;
        if (file instanceof File && file.size > 0) url = await uploadImage(supabase, resource.key, file);
        if (formData.get(`${f.name}__remove`) === "on") url = null;
        payload[f.name] = url;
        break;
      }
      default: {
        const v = String(raw ?? "").trim();
        payload[f.name] = v === "" ? null : v;
      }
    }
  }

  if (resource.slugFrom && !payload.slug) payload.slug = slugify(String(payload[resource.slugFrom]));
  if (resource.key === "posts") {
    const existing = String(formData.get("__published_at") ?? "");
    payload.published_at = payload.published ? existing || new Date().toISOString() : null;
  }

  const { error } = id
    ? await supabase.from(resource.table).update(payload).eq("id", id)
    : await supabase.from(resource.table).insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/admin/${resource.key}`);
}

export async function deleteResource(formData: FormData) {
  const supabase = await requireUser();
  const resource = getResource(String(formData.get("__resource")));
  if (!resource) throw new Error("Unknown resource");

  const { error } = await supabase.from(resource.table).delete().eq("id", String(formData.get("__id")));
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/admin/${resource.key}`);
}
