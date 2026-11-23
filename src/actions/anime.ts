"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

const done = () => {
  revalidatePath("/admin/anime");
  redirect("/admin/anime");
};

/** Creates the entry or updates the existing one (matched by AniList id, else by title). */
export async function saveAnimeProgress(formData: FormData) {
  const supabase = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const anilistId = Number(formData.get("anilist_id")) || null;
  const total = Number(formData.get("total_episodes")) || null;
  const episodeValue = Math.max(0, Number(formData.get("last_episode")) || 0);
  const episode = total === null ? episodeValue : Math.min(episodeValue, total);
  const status = total && episode >= total ? "completed" : String(formData.get("status") || "watching");

  const shot = formData.get("screenshot");
  const screenshotUrl = shot instanceof File && shot.size > 0 ? await uploadImage(supabase, "anime", shot) : null;

  const row = {
    title,
    anilist_id: anilistId,
    cover_url: String(formData.get("cover_url") || "") || null,
    last_episode: episode,
    total_episodes: total,
    status,
    ...(screenshotUrl ? { last_screenshot_url: screenshotUrl } : {}),
  };

  const lookup = supabase.from("anime_watch").select("id").limit(1);
  const { data: existing } = await (anilistId
    ? lookup.eq("anilist_id", anilistId)
    : lookup.ilike("title", title.replace(/[%_]/g, "\\$&"))
  ).maybeSingle();

  const { error } = existing
    ? await supabase.from("anime_watch").update(row).eq("id", existing.id)
    : await supabase.from("anime_watch").insert(row);
  if (error) throw new Error(error.message);
  done();
}

export async function updateAnime(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id"));
  const { data: anime, error: fetchError } = await supabase
    .from("anime_watch")
    .select("total_episodes")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const episodeValue = Math.max(0, Number(formData.get("last_episode")) || 0);
  const lastEpisode = anime.total_episodes === null ? episodeValue : Math.min(episodeValue, anime.total_episodes);
  const { error } = await supabase
    .from("anime_watch")
    .update({
      last_episode: lastEpisode,
      status: String(formData.get("status")),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  done();
}

export async function incrementEpisode(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id"));
  const { data } = await supabase.from("anime_watch").select("last_episode,total_episodes").eq("id", id).single();
  if (!data) return;
  if (data.total_episodes !== null && data.last_episode >= data.total_episodes) {
    done();
  }
  const next = data.last_episode + 1;
  const finished = data.total_episodes !== null && next >= data.total_episodes;
  await supabase.from("anime_watch").update({ last_episode: next, ...(finished ? { status: "completed" } : {}) }).eq("id", id);
  done();
}

export async function deleteAnime(formData: FormData) {
  const supabase = await requireUser();
  await supabase.from("anime_watch").delete().eq("id", String(formData.get("id")));
  done();
}
