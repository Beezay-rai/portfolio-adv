import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function PATCH(request: Request, { params }: Context) {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const episodeValue = Math.max(0, Number(body.lastEpisode) || 0);
  const { data: anime, error: fetchError } = await supabase
    .from("anime_watch")
    .select("total_episodes")
    .eq("id", id)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 });

  const lastEpisode = anime.total_episodes === null
    ? episodeValue
    : Math.min(episodeValue, anime.total_episodes);
  const { error } = await supabase
    .from("anime_watch")
    .update({ last_episode: lastEpisode, status: String(body.status) })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lastEpisode });
}

export async function POST(_: Request, { params }: Context) {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { data: anime, error: fetchError } = await supabase
    .from("anime_watch")
    .select("last_episode,total_episodes")
    .eq("id", id)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 });
  if (anime.total_episodes !== null && anime.last_episode >= anime.total_episodes) {
    return NextResponse.json({ lastEpisode: anime.last_episode, status: "completed" });
  }

  const lastEpisode = anime.last_episode + 1;
  const status = anime.total_episodes !== null && lastEpisode >= anime.total_episodes ? "completed" : undefined;
  const { error } = await supabase
    .from("anime_watch")
    .update({ last_episode: lastEpisode, ...(status ? { status } : {}) })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lastEpisode, status });
}

export async function DELETE(_: Request, { params }: Context) {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("anime_watch").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
