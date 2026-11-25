"use client";

import { useState } from "react";

export function RefreshEpisodesButton({
  id,
  onRefreshed,
}: {
  id: string;
  onRefreshed: (totalEpisodes: number | null, status: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/anime/${id}/refresh`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Refresh failed.");
      onRefreshed(result.totalEpisodes, result.status);
      setPending(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Refresh failed.");
      setPending(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={refresh} disabled={pending} className="btn-ghost !px-2 !py-1 text-xs disabled:cursor-wait disabled:opacity-50">
        <span className={pending ? "animate-spin" : ""} aria-hidden>↻</span>
        {pending ? " Refreshing…" : " Refresh episodes"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
