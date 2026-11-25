import type { AnimeSearchResult } from "@/types/anime";

const ENDPOINT = "https://graphql.anilist.co";
const FIELDS = "id title { romaji english } episodes coverImage { large }";

interface Media {
  id: number;
  title: { romaji: string | null; english: string | null };
  episodes: number | null;
  coverImage: { large: string | null };
}

export interface AnilistInfo {
  id: number;
  title: string;
  totalEpisodes: number | null;
  coverUrl: string | null;
}

async function query(q: string, variables: Record<string, unknown>, fresh = false): Promise<Media | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: q, variables }),
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 86400 } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data?.Media as Media) ?? null;
  } catch {
    return null;
  }
}

const toInfo = (m: Media | null): AnilistInfo | null =>
  m && {
    id: m.id,
    title: m.title.english ?? m.title.romaji ?? "Unknown",
    totalEpisodes: m.episodes,
    coverUrl: m.coverImage.large,
  };

export const anilistById = async (id: number, fresh = false) =>
  toInfo(await query(`query($id:Int){Media(id:$id,type:ANIME){${FIELDS}}}`, { id }, fresh));

export const anilistSearch = async (search: string) =>
  toInfo(await query(`query($s:String){Media(search:$s,type:ANIME){${FIELDS}}}`, { s: search }));

interface SearchMedia extends Media {
  format: string | null;
  seasonYear: number | null;
}

/** Name search for the manual picker. Matches English, romaji and native titles. */
export async function anilistSearchMany(search: string, limit = 8): Promise<AnimeSearchResult[]> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `query($s:String,$n:Int){Page(perPage:$n){media(search:$s,type:ANIME,sort:SEARCH_MATCH){${FIELDS} format seasonYear}}}`,
        variables: { s: search, n: limit },
      }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.data?.Page?.media ?? []) as SearchMedia[]).map((m) => {
      const { english, romaji } = m.title;
      return {
        anilistId: m.id,
        title: english ?? romaji ?? "Unknown",
        altTitle: english && romaji && english !== romaji ? romaji : null,
        episodes: m.episodes,
        format: m.format,
        year: m.seasonYear,
        coverUrl: m.coverImage.large,
      };
    });
  } catch {
    return [];
  }
}
