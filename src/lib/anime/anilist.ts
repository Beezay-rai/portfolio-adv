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

async function query(q: string, variables: Record<string, unknown>): Promise<Media | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: q, variables }),
      next: { revalidate: 86400 },
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

export const anilistById = async (id: number) =>
  toInfo(await query(`query($id:Int){Media(id:$id,type:ANIME){${FIELDS}}}`, { id }));

export const anilistSearch = async (search: string) =>
  toInfo(await query(`query($s:String){Media(search:$s,type:ANIME){${FIELDS}}}`, { s: search }));
