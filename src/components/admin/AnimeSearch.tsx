"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveAnimeProgress } from "@/actions/anime";
import type { AnimeSearchResult } from "@/types/anime";

const STATUSES = ["watching", "completed", "paused", "dropped", "planned"];

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;
}

function SaveProgressButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn disabled:cursor-wait disabled:opacity-60">
      {pending ? <><Spinner /> Saving…</> : "Save progress"}
    </button>
  );
}

export function AnimeSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<AnimeSearchResult | null>(null);

  // Debounced search while typing.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    if (picked) return;

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("failed");
        setResults(await res.json());
        setSearched(true);
        setLoading(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("Search failed. Try again.");
        setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, picked]);

  const manual = (): AnimeSearchResult => ({
    anilistId: null, title: q.trim(), altTitle: null, episodes: null, format: null, year: null, coverUrl: null,
  });

  return (
    <section className="rounded-lg border border-line bg-white p-5" aria-labelledby="anime-search-h">
      <h2 id="anime-search-h" className="font-semibold">Or search by name</h2>
      <p className="mb-4 text-sm text-ink-soft">Use this when the screenshot isn&apos;t recognised.</p>

      {!picked ? (
        <>
          <label htmlFor="anime-q" className="label">Anime title</label>
          <input
            id="anime-q"
            type="search"
            className="input"
            placeholder="e.g. Frieren, Jujutsu Kaisen, 鬼滅の刃"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />

          <div aria-live="polite" className="mt-3 text-sm">
            {loading && <p className="flex items-center gap-2 text-ink-soft"><Spinner /> Searching…</p>}
            {error && <p role="alert" className="text-red-600">{error}</p>}
            {searched && !loading && results.length === 0 && <p className="text-ink-soft">No matches found.</p>}
          </div>

          {results.length > 0 && (
            <ul className="mt-2 divide-y divide-line rounded-md border border-line">
              {results.map((r) => (
                <li key={r.anilistId}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setPicked(r)}
                    className="flex w-full items-center gap-3 p-2 text-left hover:bg-ink/5 disabled:cursor-wait disabled:opacity-60"
                  >
                    {r.coverUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.coverUrl} alt="" className="h-16 w-11 shrink-0 rounded object-cover" />
                      : <span className="h-16 w-11 shrink-0 rounded bg-line" aria-hidden />}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.title}</span>
                      {r.altTitle && <span className="block truncate text-xs text-ink-faint">{r.altTitle}</span>}
                      <span className="block text-xs text-ink-soft">
                        {[r.format?.replace(/_/g, " "), r.year, r.episodes ? `${r.episodes} eps` : null].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searched && !loading && q.trim().length >= 2 && (
            <button type="button" className="mt-3 text-sm text-accent hover:underline" onClick={() => setPicked(manual())}>
              Not listed? Add &ldquo;{q.trim()}&rdquo; manually
            </button>
          )}
        </>
      ) : (
        <form action={saveAnimeProgress} className="flex flex-col gap-4 sm:flex-row">
          {picked.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picked.coverUrl} alt="" className="h-36 w-24 shrink-0 rounded object-cover" />
          )}
          <div className="flex-1 space-y-4">
            <input type="hidden" name="anilist_id" value={picked.anilistId ?? ""} />
            <input type="hidden" name="cover_url" value={picked.coverUrl ?? ""} />
            <input type="hidden" name="total_episodes" value={picked.episodes ?? ""} />

            <div>
              <label htmlFor="m-title" className="label">Title</label>
              <input
                id="m-title"
                name="title"
                required
                readOnly={picked.anilistId !== null}
                className={`input ${picked.anilistId !== null ? "cursor-default" : ""}`}
                defaultValue={picked.title}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-32">
                <label htmlFor="m-ep" className="label">
                  Last episode{picked.episodes ? ` (of ${picked.episodes})` : ""}
                </label>
                <input id="m-ep" name="last_episode" type="number" min={0} max={picked.episodes ?? undefined} required autoFocus className="input" />
              </div>
              <div>
                <label htmlFor="m-status" className="label">Status</label>
                <select id="m-status" name="status" className="input" defaultValue="watching">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <SaveProgressButton />
              <button type="button" className="btn-ghost" onClick={() => setPicked(null)}>Back to results</button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
