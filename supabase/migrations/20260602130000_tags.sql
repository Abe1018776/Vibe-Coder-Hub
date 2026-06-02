-- Unified, admin-managed browse-by tags.
-- Auto-fed from project tags on save; admins can add/hide/remove via /admin/tags.
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null unique,
  is_hidden boolean not null default false,
  source text not null default 'auto',
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

drop policy if exists "tags public read" on public.tags;
create policy "tags public read" on public.tags
  for select to anon, authenticated
  using (is_hidden = false);

drop policy if exists "tags admin all" on public.tags;
create policy "tags admin all" on public.tags
  for all to authenticated
  using ((select p.is_admin from public.profiles p where p.id = auth.uid()))
  with check ((select p.is_admin from public.profiles p where p.id = auth.uid()));
