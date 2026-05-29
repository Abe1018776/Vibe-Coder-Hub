-- Phase 4: in-app notifications + commercial "interest" pings.

-- Per-user notification preferences (missing key = enabled).
alter table public.profiles
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;

-- Notifications (recipient-owned).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;
drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own" on public.notifications
  for select using (auth.uid() = user_id);
drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "notifications delete own" on public.notifications;
create policy "notifications delete own" on public.notifications
  for delete using (auth.uid() = user_id);
-- No insert policy: rows are created only by the SECURITY DEFINER triggers below.

-- Commercial interest pings ("I'm interested" on a project).
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'general',
  created_at timestamptz not null default now(),
  unique (project_id, user_id, kind)
);
alter table public.interests enable row level security;
drop policy if exists "interests insert own" on public.interests;
create policy "interests insert own" on public.interests
  for insert with check (auth.uid() = user_id);
drop policy if exists "interests select own" on public.interests;
create policy "interests select own" on public.interests
  for select using (auth.uid() = user_id);

-- Internal helper: create a notification, honoring recipient prefs; never notify self.
create or replace function public.notify(
  p_user uuid,
  p_type text,
  p_actor uuid default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_data jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = public as $$
declare pref jsonb;
begin
  if p_user is null then return; end if;
  if p_actor is not null and p_actor = p_user then return; end if;
  select notification_prefs into pref from public.profiles where id = p_user;
  if pref ? p_type and (pref ->> p_type) = 'false' then return; end if;
  insert into public.notifications (user_id, type, actor_id, entity_type, entity_id, data)
  values (p_user, p_type, p_actor, p_entity_type, p_entity_id, coalesce(p_data, '{}'::jsonb));
end; $$;
revoke all on function public.notify(uuid, text, uuid, text, uuid, jsonb) from public, anon, authenticated;

-- upvote -> notify project owner
create or replace function public.tg_notify_upvote() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_name text;
begin
  select owner_id, name into v_owner, v_name from public.projects where id = new.project_id;
  perform public.notify(v_owner, 'upvote', new.user_id, 'project', new.project_id,
    jsonb_build_object('project_name', v_name));
  return new;
end; $$;
drop trigger if exists notify_on_upvote on public.upvotes;
create trigger notify_on_upvote after insert on public.upvotes
  for each row execute function public.tg_notify_upvote();

-- comment -> notify project owner (actor hidden when the comment is anonymous)
create or replace function public.tg_notify_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_name text;
begin
  select owner_id, name into v_owner, v_name from public.projects where id = new.project_id;
  if v_owner = new.author_id then return new; end if;
  perform public.notify(v_owner, 'comment',
    case when new.is_anonymous then null else new.author_id end,
    'project', new.project_id, jsonb_build_object('project_name', v_name));
  return new;
end; $$;
drop trigger if exists notify_on_comment on public.comments;
create trigger notify_on_comment after insert on public.comments
  for each row execute function public.tg_notify_comment();

-- gig application (thread opened) -> notify gig poster
create or replace function public.tg_notify_gig_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_poster uuid; v_title text; v_slug text;
begin
  select poster_id, title, slug into v_poster, v_title, v_slug
  from public.gigs where id = new.gig_id;
  perform public.notify(v_poster, 'gig_application', new.applicant_id, 'gig', new.gig_id,
    jsonb_build_object('gig_title', v_title, 'slug', v_slug, 'thread_id', new.id));
  return new;
end; $$;
drop trigger if exists notify_on_gig_application on public.gig_threads;
create trigger notify_on_gig_application after insert on public.gig_threads
  for each row execute function public.tg_notify_gig_application();

-- gig message -> notify the other thread participant
create or replace function public.tg_notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_applicant uuid; v_poster uuid; v_gig uuid; v_title text; v_slug text; v_recipient uuid;
begin
  select gt.applicant_id, g.poster_id, g.id, g.title, g.slug
    into v_applicant, v_poster, v_gig, v_title, v_slug
  from public.gig_threads gt join public.gigs g on g.id = gt.gig_id
  where gt.id = new.thread_id;
  v_recipient := case when new.sender_id = v_poster then v_applicant else v_poster end;
  perform public.notify(v_recipient, 'message', new.sender_id, 'gig', v_gig,
    jsonb_build_object('gig_title', v_title, 'slug', v_slug, 'thread_id', new.thread_id));
  return new;
end; $$;
drop trigger if exists notify_on_message on public.messages;
create trigger notify_on_message after insert on public.messages
  for each row execute function public.tg_notify_message();

-- competition winner picked -> notify the winning submitter
create or replace function public.tg_notify_competition_winner() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_winner uuid;
begin
  if new.winner_submission_id is not null
     and new.winner_submission_id is distinct from old.winner_submission_id then
    select submitter_id into v_winner
    from public.competition_submissions where id = new.winner_submission_id;
    perform public.notify(v_winner, 'competition_winner', new.creator_id, 'competition', new.id,
      jsonb_build_object('title', new.title, 'slug', new.slug));
  end if;
  return new;
end; $$;
drop trigger if exists notify_on_competition_winner on public.competitions;
create trigger notify_on_competition_winner after update on public.competitions
  for each row execute function public.tg_notify_competition_winner();

-- commercial interest -> notify project owner
create or replace function public.tg_notify_interest() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_name text;
begin
  select owner_id, name into v_owner, v_name from public.projects where id = new.project_id;
  perform public.notify(v_owner, 'interest', new.user_id, 'project', new.project_id,
    jsonb_build_object('project_name', v_name, 'kind', new.kind));
  return new;
end; $$;
drop trigger if exists notify_on_interest on public.interests;
create trigger notify_on_interest after insert on public.interests
  for each row execute function public.tg_notify_interest();
