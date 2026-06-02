-- Profile display preference: when false, only the @handle is shown publicly
-- (the real name is hidden everywhere — posts, comments, profile). Default true
-- preserves current behavior for existing accounts.
alter table public.profiles
  add column if not exists show_real_name boolean not null default true;
