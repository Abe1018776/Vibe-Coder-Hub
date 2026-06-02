-- Featured profiles
alter table public.profiles add column if not exists is_featured boolean not null default false;

-- Admins can update ANY profile (for user management). IMPORTANT: a policy ON public.profiles
-- must NOT re-query public.profiles under RLS — that causes "infinite recursion detected in
-- policy for relation profiles" and takes the whole app down. So the admin check goes through
-- a SECURITY DEFINER helper (runs as owner, bypasses RLS). No admin SELECT policy is added —
-- the admin_list_users() SECURITY DEFINER RPC already lists users for the admin panel.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- "Posted as official YidVibe" marker for admin-authored content.
alter table public.gigs add column if not exists posted_as_official boolean not null default false;
alter table public.competitions add column if not exists posted_as_official boolean not null default false;
alter table public.events add column if not exists posted_as_official boolean not null default false;

-- Admin-only: list all users with email (auth.users) + project count.
create or replace function public.admin_list_users(search text default null, filter text default 'all')
returns table (
  id uuid, handle text, name text, avatar_url text, email text,
  follower_count int, is_admin boolean, is_verified boolean, is_featured boolean,
  is_builder boolean, is_public boolean, created_at timestamptz, project_count bigint
) language plpgsql security definer set search_path = public as $$
begin
  if not coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false) then
    raise exception 'not authorized';
  end if;
  return query
  select p.id, p.handle, p.name, p.avatar_url, u.email::text,
    p.follower_count, p.is_admin, p.is_verified, p.is_featured,
    p.is_builder, p.is_public, p.created_at,
    (select count(*) from public.projects pr where pr.owner_id = p.id) as project_count
  from public.profiles p
  join auth.users u on u.id = p.id
  where (search is null or search = '' or p.name ilike '%'||search||'%' or p.handle ilike '%'||search||'%' or u.email ilike '%'||search||'%')
    and (
      filter = 'all'
      or (filter = 'admins' and p.is_admin)
      or (filter = 'verified' and p.is_verified)
      or (filter = 'featured' and p.is_featured)
      or (filter = 'builders' and p.is_builder)
    )
  order by p.created_at desc;
end; $$;
revoke all on function public.admin_list_users(text, text) from public, anon;
grant execute on function public.admin_list_users(text, text) to authenticated;
