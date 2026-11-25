"use client";

import { useState } from "react";
import { RefreshEpisodesButton } from "@/components/admin/RefreshEpisodesButton";
import { formatDate } from "@/lib/utils";
import type { AnimeEntry } from "@/types/database";

const STATUSES = ["watching", "completed", "paused", "dropped", "planned"];

export function AnimeList({ initialList }: { initialList: AnimeEntry[] }) {
  const [list, setList] = useState(initialList);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  if (list.length === 0) {
    return <p className="text-ink-soft">Nothing tracked yet. Upload your first screenshot above.</p>;
  }

  const request = async (id: string, method: "PATCH" | "POST" | "DELETE", body?: object) => {
    setPendingId(id);
    setError(null);
    setErrorId(null);
    try {
      const response = await fetch(`/api/anime/${id}`, {
        method,
        ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Action failed.");
      return result;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Action failed.");
      setErrorId(id);
      return null;
    } finally {
      setPendingId(null);
    }
  };

  const updateEpisodes = (id: string, totalEpisodes: number | null, status: string) => {
    setList((current) => current.map((anime) => (
      anime.id === id
        ? { ...anime, total_episodes: totalEpisodes, status: status as AnimeEntry["status"] }
        : anime
    )));
  };

  return (
    <ul className="max-w-3xl space-y-3">
      {list.map((a) => {
        const isPending = pendingId === a.id;
        return (
          <li key={a.id} className="flex gap-4 rounded-lg border border-line bg-white p-4">
            {a.cover_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={a.cover_url} alt="" className="h-24 w-16 shrink-0 rounded object-cover" />
              : <div className="h-24 w-16 shrink-0 rounded bg-line" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-ink-soft">
                Episode {a.last_episode}{a.total_episodes ? ` of ${a.total_episodes}` : ""}, updated {formatDate(a.updated_at)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <form
                  className="flex items-center gap-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const result = await request(a.id, "PATCH", {
                      lastEpisode: form.get("last_episode"),
                      status: form.get("status"),
                    });
                    if (result) {
                      setList((current) => current.map((anime) => anime.id === a.id
                        ? { ...anime, last_episode: result.lastEpisode, status: String(form.get("status")) as AnimeEntry["status"] }
                        : anime));
                    }
                  }}
                >
                  <label className="sr-only" htmlFor={`ep-${a.id}`}>Episode</label>
                  <input id={`ep-${a.id}`} name="last_episode" type="number" min={0} max={a.total_episodes ?? undefined} defaultValue={a.last_episode} disabled={isPending} className="input !w-20 !py-1 disabled:opacity-60" />
                  <label className="sr-only" htmlFor={`st-${a.id}`}>Status</label>
                  <select id={`st-${a.id}`} name="status" defaultValue={a.status} disabled={isPending} className="input !w-auto !py-1 disabled:opacity-60">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button disabled={isPending} className="btn-ghost !py-1 text-xs disabled:cursor-wait disabled:opacity-50">
                    {isPending ? "Saving…" : "Save"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await request(a.id, "POST");
                    if (result) {
                      setList((current) => current.map((anime) => anime.id === a.id
                        ? { ...anime, last_episode: result.lastEpisode, ...(result.status ? { status: result.status } : {}) }
                        : anime));
                    }
                  }}
                  disabled={isPending || (a.total_episodes !== null && a.last_episode >= a.total_episodes)}
                  className="btn-ghost !py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Updating…" : "Watched next episode"}
                </button>
                {a.anilist_id !== null && (
                  <RefreshEpisodesButton
                    id={a.id}
                    onRefreshed={(totalEpisodes, status) => updateEpisodes(a.id, totalEpisodes, status)}
                  />
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Remove "${a.title}"?`)) return;
                    const result = await request(a.id, "DELETE");
                    if (result !== null) setList((current) => current.filter((anime) => anime.id !== a.id));
                  }}
                  disabled={isPending}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              {error && errorId === a.id && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
