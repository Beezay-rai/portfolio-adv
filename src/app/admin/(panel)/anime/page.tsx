import { AnimeList } from "@/components/admin/AnimeList";
import { AnimeSearch } from "@/components/admin/AnimeSearch";
import { AnimeUploader } from "@/components/admin/AnimeUploader";
import { createClient } from "@/lib/supabase/server";
import type { AnimeEntry } from "@/types/database";

export default async function AnimePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("anime_watch").select("*").order("updated_at", { ascending: false });
  const list = (data ?? []) as AnimeEntry[];

  // Changes after every save, so the forms below reset themselves.
  const refreshKey = list[0] ? `${list[0].id}-${list[0].updated_at}` : "empty";

  return (
    <>
      <h1 className="text-2xl font-semibold">Anime tracker</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Upload a screenshot of where you stopped. The show and episode are filled in for you.</p>

      <div className="max-w-3xl space-y-6">
        <AnimeUploader key={`u-${refreshKey}`} />
        <AnimeSearch key={`s-${refreshKey}`} />
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Your list</h2>
      <AnimeList initialList={list} />
    </>
  );
}
