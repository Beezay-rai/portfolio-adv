export type AnimeStatus = "watching" | "completed" | "paused" | "dropped" | "planned";

export interface AnimeMatch {
  title: string;
  anilistId: number | null;
  episode: number | null;
  totalEpisodes: number | null;
  coverUrl: string | null;
  /** 0–1, only for scene matches */
  similarity: number | null;
  source: "trace.moe" | "claude";
}

export interface Recognition {
  best: AnimeMatch | null;
  alternatives: AnimeMatch[];
  confident: boolean;
}
