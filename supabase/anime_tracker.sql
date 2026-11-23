
create table if not exists portfolio.anime_watch (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  anilist_id int unique,
  cover_url text,
  last_episode int not null default 0,
  total_episodes int,
  status text not null default 'watching'
    check (status in ('watching','completed','paused','dropped','planned')),
  last_screenshot_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists anime_watch_updated on portfolio.anime_watch;
create trigger anime_watch_updated before update on portfolio.anime_watch
  for each row execute function portfolio.set_updated_at();

alter table portfolio.anime_watch enable row level security;
create policy "admin all anime" on portfolio.anime_watch
  for all to authenticated using (true) with check (true);

grant usage on schema portfolio to anon, authenticated, service_role;
grant select, insert, update, delete on table portfolio.anime_watch to authenticated, service_role;
