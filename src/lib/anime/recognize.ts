import type { AnimeMatch, Recognition } from "@/types/anime";
import { anilistById, anilistSearch } from "./anilist";

const TRACE_URL = "https://api.trace.moe/search?cutBorders&anilistInfo";
const CONFIDENT_SIMILARITY = 0.9; // trace.moe: below ~0.9 is often a wrong match

interface TraceResult {
  anilist: { id: number; title: { romaji?: string; english?: string; native?: string } };
  episode: number | string | number[] | null;
  similarity: number;
}

const parseEpisode = (e: TraceResult["episode"]): number | null => {
  const n = Array.isArray(e) ? e[0] : typeof e === "string" ? parseInt(e, 10) : e;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

/** Scene search: finds which anime/episode a screenshot is from. */
async function traceMoe(file: File): Promise<AnimeMatch[]> {
  const res = await fetch(TRACE_URL, { method: "POST", headers: { "Content-Type": file.type }, body: file });
  if (!res.ok) throw new Error(`trace.moe returned ${res.status}`);
  const json = (await res.json()) as { result?: TraceResult[]; error?: string };
  if (json.error || !json.result) throw new Error(json.error ?? "No result");

  // best frame per anime, top 3 anime
  const best = new Map<number, TraceResult>();
  for (const r of json.result) {
    if (!best.has(r.anilist.id) || r.similarity > best.get(r.anilist.id)!.similarity) best.set(r.anilist.id, r);
  }
  const top = [...best.values()].sort((a, b) => b.similarity - a.similarity).slice(0, 3);

  return Promise.all(
    top.map(async (r): Promise<AnimeMatch> => {
      const info = await anilistById(r.anilist.id);
      return {
        title: info?.title ?? r.anilist.title.english ?? r.anilist.title.romaji ?? "Unknown",
        anilistId: r.anilist.id,
        episode: parseEpisode(r.episode),
        totalEpisodes: info?.totalEpisodes ?? null,
        coverUrl: info?.coverUrl ?? null,
        similarity: r.similarity,
        source: "trace.moe",
      };
    }),
  );
}

const PROMPT = `This is a screenshot from an anime the user was watching. Identify the anime title and episode number.
Use on-screen text first: streaming player overlays (e.g. "S1 E5"), episode title cards, subtitles that name the episode, or a media player's title bar / file name. If there is no text, you may recognise the show from its characters and art style.
Never guess an episode number: only return one if it is visible as text.
Reply with ONLY this JSON: {"title": string|null, "episode": number|null, "evidence": string}`;

/** Optional text/vision fallback. Needs ANTHROPIC_API_KEY. */
async function claudeVision(file: File): Promise<{ title: string | null; episode: number | null } | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  const types = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!key || !types.includes(file.type) || file.size > 5 * 1024 * 1024) return null;

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: file.type, data } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string = json.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "null");
    return parsed ? { title: parsed.title ?? null, episode: Number.isFinite(parsed.episode) ? parsed.episode : null } : null;
  } catch {
    return null;
  }
}

export async function recognize(file: File): Promise<Recognition> {
  let scenes: AnimeMatch[] = [];
  try {
    scenes = await traceMoe(file);
  } catch {
    /* fall through to vision */
  }

  const top = scenes[0];
  if (top && (top.similarity ?? 0) >= CONFIDENT_SIMILARITY) {
    return { best: top, alternatives: scenes.slice(1), confident: top.episode !== null };
  }

  const vision = await claudeVision(file);
  if (vision?.title) {
    const info = await anilistSearch(vision.title);
    const sameAsScene = info && scenes.find((s) => s.anilistId === info.id);
    const match: AnimeMatch = {
      title: info?.title ?? vision.title,
      anilistId: info?.id ?? null,
      episode: vision.episode ?? sameAsScene?.episode ?? null,
      totalEpisodes: info?.totalEpisodes ?? null,
      coverUrl: info?.coverUrl ?? null,
      similarity: null,
      source: "claude",
    };
    return { best: match, alternatives: scenes.filter((s) => s.anilistId !== match.anilistId), confident: match.episode !== null };
  }

  return { best: top ?? null, alternatives: scenes.slice(1), confident: false };
}
