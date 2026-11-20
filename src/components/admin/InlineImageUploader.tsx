"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET } from "@/lib/utils";

/** Uploads an image straight to Supabase Storage and gives back Markdown to paste into the editor. */
export function InlineImageUploader({ folder }: { folder: string }) {
  const [snippet, setSnippet] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    const supabase = createClient();
    const path = `${folder}/inline/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) return setStatus("error");
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setSnippet(`![${file.name.replace(/\.[^.]+$/, "")}](${data.publicUrl})`);
    setStatus("idle");
    e.target.value = "";
  }

  return (
    <div className="mt-2 rounded-md border border-dashed border-line p-3 text-sm">
      <label className="font-medium">
        Add an image to the text{" "}
        <input type="file" accept="image/*" onChange={onChange} className="ml-2 text-xs" />
      </label>
      {status === "uploading" && <p className="mt-2 text-ink-soft">Uploading…</p>}
      {status === "error" && <p role="alert" className="mt-2 text-red-600">Upload failed. Check that you are signed in and the storage policies exist.</p>}
      {snippet && (
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-ink/5 px-2 py-1 text-xs">{snippet}</code>
          <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => navigator.clipboard.writeText(snippet)}>
            Copy Markdown
          </button>
        </div>
      )}
    </div>
  );
}
