# Portfolio + CMS (Next.js 15, TypeScript, Supabase)

A public portfolio site and a private admin panel (`/admin`) to manage **work experience, education, projects and blog posts** (with cover images and inline images). Data lives in Supabase Postgres; images in Supabase Storage.

## Setup
1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql` (tables, RLS policies, `portfolio` storage bucket).
3. Authentication → Users → **Add user** (your email + password). Then Authentication → Sign In / Providers → **disable "Allow new users to sign up"** so only you can edit.
4. `cp .env.example .env.local` and fill in Project URL + anon key (Project Settings → API).
5. `npm install && npm run dev`
6. Visit `/admin`, sign in, add content. Edit your name/bio/links in `src/config/site.ts`.

## Structure
```
supabase/schema.sql          DB schema, RLS, storage policies
src/
  middleware.ts              Protects /admin/*
  config/
    site.ts                  Name, bio, socials
    resources.ts             CMS field definitions (drives forms, lists, saving)
  types/database.ts          Row types
  lib/
    queries.ts               Public read queries
    utils.ts                 Helpers
    supabase/                client / server / public / middleware clients
  actions/                   Server actions: auth.ts, resource.ts (save, delete, upload)
  components/
    ui/                      Markdown, Cover, Tags
    site/                    Header, Footer, Timeline, cards
    admin/                   ResourceForm, FieldInput, uploader, delete button
  app/
    (site)/                  Public pages: home, projects, blog
    admin/login              Sign-in
    admin/(panel)/           Dashboard + [resource] list / new / [id] edit
```

## Adding a new content type
1. Add a table in SQL (+ RLS). 2. Add an entry in `src/config/resources.ts`. 3. Add a query and page for the public side. The admin UI appears automatically.

## Deploy
Push to GitHub → import in Vercel → add the three env vars.
