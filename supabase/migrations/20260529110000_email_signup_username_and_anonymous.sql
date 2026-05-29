-- Phase 2: email/password signups can choose a username (used for the handle),
-- and projects/comments can be posted anonymously.

-- Honor a chosen username for the handle; fall back to the email local-part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  base_handle text;
  final_handle text;
  n int := 0;
begin
  base_handle := regexp_replace(
    lower(coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1),
      'builder'
    )),
    '[^a-z0-9]+', '', 'g'
  );
  if base_handle is null or base_handle = '' then
    base_handle := 'builder';
  end if;
  base_handle := left(base_handle, 24);
  final_handle := base_handle;
  while exists (select 1 from public.profiles where handle = final_handle) loop
    n := n + 1;
    final_handle := base_handle || n::text;
  end loop;

  insert into public.profiles (id, handle, name, avatar_url)
  values (
    new.id,
    final_handle,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1),
      'Builder'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$;

-- Anonymous posting (projects + comments only).
alter table public.projects add column if not exists is_anonymous boolean not null default false;
alter table public.comments add column if not exists is_anonymous boolean not null default false;
comment on column public.projects.is_anonymous is 'When true, hide the owner publicly and show "Anonymous". Owner/admin still resolve identity.';
