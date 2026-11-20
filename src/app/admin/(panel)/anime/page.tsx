import { incrementEpisode, updateAnime } from "@/actions/anime";
import { AnimeUploader } from "@/components/admin/AnimeUploader";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { AnimeEntry } from "@/types/database";

const STATUSES = ["watching", "completed", "paused", "dropped", "planned"];

export default async function AnimePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("anime_watch").select("*").order("updated_at", { ascending: false });
  const list = (data ?? []) as AnimeEntry[];

  return (
    <>
      <h1 className="text-2xl font-semibold">Anime tracker</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Upload a screenshot of where you stopped. The show and episode are filled in for you.</p>

      <div className="max-w-3xl"><AnimeUploader /></div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Your list</h2>
      {list.length === 0 ? (
        <p className="text-ink-soft">Nothing tracked yet. Upload your first screenshot above.</p>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {list.map((a) => (
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
                  <form action={updateAnime} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <label className="sr-only" htmlFor={`ep-${a.id}`}>Episode</label>
                    <input id={`ep-${a.id}`} name="last_episode" type="number" min={0} defaultValue={a.last_episode} className="input !w-20 !py-1" />
                    <label className="sr-only" htmlFor={`st-${a.id}`}>Status</label>
                    <select id={`st-${a.id}`} name="status" defaultValue={a.status} className="input !w-auto !py-1">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button className="btn-ghost !py-1 text-xs">Save</button>
                  </form>
                  <form action={incrementEpisode}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="btn-ghost !py-1 text-xs">Watched next episode</button>
                  </form>
                  <ConfirmDelete id={a.id} title={a.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
