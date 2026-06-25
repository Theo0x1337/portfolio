-- Blog posts schema for Supabase.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- The server (server/src/db.ts) reads/writes this table when SUPABASE_URL and
-- SUPABASE_SERVICE_ROLE_KEY are set in server/.env.

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  content     text        not null,
  excerpt     text        not null,
  slug        text        not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Slug is how single posts are fetched (getPostBySlug), so index it.
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Row Level Security.
-- The server talks to Supabase with the SERVICE ROLE key, which bypasses RLS,
-- so writes (create/update/delete) always work from the backend.
-- We still enable RLS and add a public read policy so that, if you ever query
-- the table directly from the browser with the anon key, reads are allowed but
-- writes are not.
alter table public.posts enable row level security;

create policy "Public read access"
  on public.posts
  for select
  using (true);
