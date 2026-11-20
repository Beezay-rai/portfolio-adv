import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET } from "@/lib/utils";

export async function uploadImage(supabase: SupabaseClient, folder: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
