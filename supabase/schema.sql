-- Run this in Supabase → SQL Editor.

create extension if not exists "pgcrypto";

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ───────── Tables ─────────
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  tech text[] not null default '{}',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_date date,
  end_date date,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,              -- markdown
  cover_url text,
  tech text[] not null default '{}',
  live_url text,
  repo_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,                  -- markdown
  cover_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['experiences','education','projects','posts'] loop
    execute format('drop trigger if exists %I_updated on %I', t, t);
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- ───────── Row Level Security ─────────
-- Public: read experiences/education, and only *published* projects/posts.
-- Authenticated (you): full access. Disable public sign-ups in Auth settings!
create policy "public read experiences" on experiences for select using (true);
create policy "public read education"   on education   for select using (true);
create policy "public read projects"    on projects    for select using (published or auth.role() = 'authenticated');
create policy "public read posts"       on posts       for select using (published or auth.role() = 'authenticated');

create policy "admin write experiences" on experiences for all to authenticated using (true) with check (true);
create policy "admin write education"   on education   for all to authenticated using (true) with check (true);
create policy "admin write projects"    on projects    for all to authenticated using (true) with check (true);
create policy "admin write posts"       on posts       for all to authenticated using (true) with check (true);

-- ───────── Storage (images) ─────────
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "admin upload images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');
create policy "admin update images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');
create policy "admin delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');
