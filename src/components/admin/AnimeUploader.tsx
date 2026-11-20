"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveAnimeProgress } from "@/actions/anime";
import type { AnimeMatch, Recognition } from "@/types/anime";

const STATUSES = ["watching", "completed", "paused", "dropped", "planned"];

/** Shrinks big screenshots: faster upload, and keeps requests under hosting body limits. */
async function downscale(file: File, max = 1280): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function AnimeUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rec, setRec] = useState<Recognition | null>(null);
  const [match, setMatch] = useState<AnimeMatch | null>(null);
  const [title, setTitle] = useState("");
  const [episode, setEpisode] = useState("");

  const select = (m: AnimeMatch | null) => {
    setMatch(m);
    setTitle(m?.title ?? "");
    setEpisode(m?.episode?.toString() ?? "");
  };

  const handleFile = useCallback(async (original: File) => {
    if (!original.type.startsWith("image/")) return setError("Choose an image file.");
    const file = await downscale(original);

    // Put the file in the form's input so it is saved with the entry.
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;

    setPreview(URL.createObjectURL(file));
    setError(null);
    setRec(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/anime/recognize", { method: "POST", body });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Recognition failed.");
      const data: Recognition = await res.json();
      setRec(data);
      select(data.best);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recognition failed.");
      setRec({ best: null, alternatives: [], confident: false });
      select(null);
    } finally {
      setBusy(false);
    }
  }, []);

  // Paste a screenshot straight from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith("image/"));
      if (f) handleFile(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const note = !match
    ? "Couldn't recognise this screenshot. Type the title and episode below."
    : match.source === "trace.moe"
      ? `Scene match, ${Math.round((match.similarity ?? 0) * 100)}% similar.`
      : "Read from the text in the screenshot.";

  return (
    <form action={saveAnimeProgress} className="rounded-lg border border-line bg-white p-5">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft hover:border-ink focus-within:border-accent"
      >
        <span className="font-medium text-ink">Drop your last-watched screenshot here</span>
        <span>or click to choose, or paste with Ctrl/Cmd+V</span>
        <input
          ref={inputRef}
          type="file"
          name="screenshot"
          accept="image/*"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </label>

      {busy && <p role="status" className="mt-4 text-sm text-ink-soft">Identifying the anime…</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

      {rec && !busy && (
        <div className="mt-5 grid gap-5 sm:grid-cols-[200px_1fr]">
          {preview && /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt="Your screenshot" className="w-full rounded border border-line" />}
          <div className="space-y-4">
            <p className={`text-sm ${rec.confident ? "text-ink-soft" : "text-amber-700"}`}>
              {note} {match && !rec.confident && "Check the title and episode before saving."}
            </p>

            <input type="hidden" name="anilist_id" value={match?.anilistId ?? ""} />
            <input type="hidden" name="cover_url" value={match?.coverUrl ?? ""} />
            <input type="hidden" name="total_episodes" value={match?.totalEpisodes ?? ""} />

            <div>
              <label htmlFor="a-title" className="label">Title</label>
              <input id="a-title" name="title" required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="w-32">
                <label htmlFor="a-ep" className="label">Last episode</label>
                <input id="a-ep" name="last_episode" type="number" min={0} required className="input" value={episode} onChange={(e) => setEpisode(e.target.value)} />
              </div>
              <div>
                <label htmlFor="a-status" className="label">Status</label>
                <select id="a-status" name="status" className="input" defaultValue="watching">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {rec.alternatives.length > 0 && (
              <div className="text-sm">
                <p className="mb-1 text-ink-soft">Not the right show?</p>
                <div className="flex flex-wrap gap-2">
                  {[...(match && rec.best !== match ? [rec.best].filter(Boolean) as AnimeMatch[] : []), ...rec.alternatives].map((a) => (
                    <button key={`${a.anilistId}-${a.title}`} type="button" className="btn-ghost !py-1 text-xs" onClick={() => select(a)}>
                      {a.title}{a.episode ? `, ep ${a.episode}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="btn">Save progress</button>
          </div>
        </div>
      )}
    </form>
  );
}
