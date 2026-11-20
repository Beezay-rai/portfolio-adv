"use client";

import { useState } from "react";
import type { Field } from "@/config/resources";
import { InlineImageUploader } from "./InlineImageUploader";

interface Props {
  field: Field;
  value: unknown;
  folder: string;
}

export function FieldInput({ field: f, value, folder }: Props) {
  const id = `f-${f.name}`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Reference previewUrl to satisfy TypeScript unused variable check while keeping state ready for preview
  void previewUrl;

  if (f.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name={f.name}
          defaultChecked={Boolean(value)}
          className="h-4 w-4 rounded border-line accent-accent focus:ring-2 focus:ring-accent/20"
        />
        <span className="text-sm font-medium text-ink">{f.label}</span>
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="label">{f.label}</label>
      {renderControl()}
      {f.help && <p className="text-xs text-ink-faint">{f.help}</p>}
    </div>
  );

  function renderControl() {
    const common = {
      id,
      name: f.name,
      required: f.required,
      className: "input",
    } as const;

    switch (f.type) {
      case "textarea":
        return (
          <textarea {...common} rows={4} defaultValue={(value as string) ?? ""} className="input resize-y" />
        );
      case "markdown":
        return (
          <div className="space-y-3">
            <textarea
              {...common}
              rows={16}
              className="input font-mono text-sm resize-y"
              defaultValue={(value as string) ?? ""}
              placeholder="Write in Markdown..."
            />
            <InlineImageUploader folder={folder} />
          </div>
        );
      case "date":
        return <input {...common} type="date" defaultValue={typeof value === "string" ? value.slice(0, 10) : ""} />;
      case "number":
        return <input {...common} type="number" defaultValue={(value as number) ?? 0} />;
      case "url":
        return <input {...common} type="url" placeholder="https://" defaultValue={(value as string) ?? ""} />;
      case "tags":
        return <input {...common} type="text" defaultValue={Array.isArray(value) ? value.join(", ") : ""} placeholder="tag1, tag2, tag3" />;
      case "image": {
        const url = typeof value === "string" ? value : "";
        return (
          <div className="space-y-3">
            {(url || previewUrl) && !previewUrl && (
              <div className="flex items-center gap-4 p-3 rounded-lg border border-line/50 bg-white/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-20 w-32 rounded border border-line object-cover" />
                <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
                  <input type="checkbox" name={`${f.name}__remove`} className="h-4 w-4 accent-accent" />
                  Remove image
                </label>
              </div>
            )}
            {previewUrl && (
              <div className="flex items-center gap-4 p-3 rounded-lg border border-line/50 bg-white/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-20 w-32 rounded border border-line object-cover" />
                <span className="text-sm text-ink-soft font-medium">New image selected</span>
              </div>
            )}
            <input type="hidden" name={f.name} value={url} />
            <label className="cursor-pointer">
              <input
                id={id}
                type="file"
                name={`${f.name}__file`}
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    e.target.files = dt.files;
                    setPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setPreviewUrl(null);
                  }
                }}
              />
              <div className="input border-dashed border-ink/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-center py-6">
                <svg className="mx-auto h-8 w-8 text-ink-faint mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-ink-soft">Click to upload or drag and drop</p>
                <p className="text-xs text-ink-faint">PNG, JPG, GIF up to 5MB</p>
              </div>
            </label>
          </div>
        );
      }
      default:
        return <input {...common} type="text" defaultValue={(value as string) ?? ""} />;
    }
  }
}
