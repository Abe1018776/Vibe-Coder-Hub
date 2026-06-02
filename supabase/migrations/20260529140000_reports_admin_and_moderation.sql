-- Phase 5: reporting + admin foundation + soft-hide moderation.

-- Admin flag. Users may NOT grant it to themselves (guarded below).
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Prevent privilege escalation: an is_admin change is only honored when made by
-- direct SQL (auth.uid() is null -> service/bootstrap) or by an existing admin.
create or replace function public.guard_profile_admin() returns trigger
language plpgsql security definer set search_path = public as $function$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.uid() is null then
      return new; -- direct SQL / service role (bootstrap): allow
    end if;
    if not coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false) then
      new.is_admin := old.is_admin; -- non-admin attempt: silently ignore
    end if;
  end if;
  return new;
end; $function$;
revoke all on function public.guard_profile_admin() from public, anon, authenticated;
drop trigger if exists guard_profile_admin_update on public.profiles;
create trigger guard_profile_admin_update before update on public.profiles
  for each row execute function public.guard_profile_admin();

-- Soft-hide flags (public reads filter these out; admins/queue still see them).
alter table public.projects add column if not exists hidden boolean not null default false;
alter table public.comments add column if not exists hidden boolean not null default false;

-- Reports.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('project','comment','profile','gig','competition','event')),
  target_id uuid not null,
  reason text not null check (reason in ('spam','inappropriate','scam','offensive','copyright','other')),
  details text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;
drop policy if exists "reports insert signed-in" on public.reports;
create policy "reports insert signed-in" on public.reports
  for insert to authenticated with check (auth.uid() = reporter_id);
drop policy if exists "reports admin select" on public.reports;
create policy "reports admin select" on public.reports
  for select to authenticated
  using ((select p.is_admin from public.profiles p where p.id = auth.uid()));
drop policy if exists "reports admin update" on public.reports;
create policy "reports admin update" on public.reports
  for update to authenticated
  using ((select p.is_admin from public.profiles p where p.id = auth.uid()))
  with check ((select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Admins can act on any content (hide/delete). OR'd with existing owner policies.
do $$
declare t text;
begin
  foreach t in array array['projects','comments','gigs','competitions','events'] loop
    execute format('drop policy if exists %I on public.%I', 'admin manage ' || t, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select p.is_admin from public.profiles p where p.id = auth.uid())) with check ((select p.is_admin from public.profiles p where p.id = auth.uid()))',
      'admin manage ' || t, t
    );
  end loop;
end $$;

-- Bootstrap the first admin (the project owner). New admins are granted by an
-- existing admin; this row is the seed.
update public.profiles set is_admin = true where handle = 'elimelechmoster';
