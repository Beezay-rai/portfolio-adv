import { NextResponse } from "next/server";
import { anilistById } from "@/lib/anime/anilist";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const { data: anime, error: fetchError } = await supabase
      .from("anime_watch")
      .select("anilist_id,last_episode,status")
      .eq("id", id)
      .single();
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 });
    if (!anime.anilist_id) return NextResponse.json({ error: "This anime is not linked to AniList." }, { status: 400 });

    const info = await anilistById(anime.anilist_id, true);
    if (!info) return NextResponse.json({ error: "Unable to refresh episode information from AniList." }, { status: 502 });

    const status = anime.status === "completed" && info.totalEpisodes !== null && anime.last_episode < info.totalEpisodes
      ? "watching"
      : anime.status;
    const { error } = await supabase
      .from("anime_watch")
      .update({ total_episodes: info.totalEpisodes, status })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ totalEpisodes: info.totalEpisodes, status });
  } catch (error) {
    console.error("Anime episode refresh error:", error);
    return NextResponse.json({ error: "Failed to refresh episode information." }, { status: 500 });
  }
}
