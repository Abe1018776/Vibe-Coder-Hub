-- Redesign: admin-controlled "Featured" flag on projects (gold badge on the card).
-- Additive + safe. Admin writes go through the existing admin-update RLS policy
-- on public.projects (added in the reports/moderation migration).

alter table public.projects
  add column if not exists featured boolean not null default false;

-- Small partial index so "featured" lookups stay cheap as the table grows.
create index if not exists projects_featured_idx
  on public.projects (featured)
  where featured;
