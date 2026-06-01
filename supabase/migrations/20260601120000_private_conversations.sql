-- Phase 2: private replies — lightweight 1:1 conversations between members
-- (distinct from gig threads). Not a chat app: short two-way note threads.

-- Who may receive private notes.
do $$ begin
  create type public.dm_privacy as enum ('everyone', 'followers', 'none');
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists dm_privacy public.dm_privacy not null default 'everyone';

-- One row per unordered participant pair (normalized so participant_a < participant_b).
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  about_type text,
  about_id uuid,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint conversations_distinct check (participant_a <> participant_b),
  constraint conversations_ordered check (participant_a < participant_b)
);
create unique index if not exists conversations_pair_uniq
  on public.conversations (participant_a, participant_b);
create index if not exists conversations_a_idx
  on public.conversations (participant_a, last_message_at desc);
create index if not exists conversations_b_idx
  on public.conversations (participant_b, last_message_at desc);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists conversation_messages_convo_idx
  on public.conversation_messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;

drop policy if exists "conversations select participant" on public.conversations;
create policy "conversations select participant" on public.conversations
  for select using (auth.uid() = participant_a or auth.uid() = participant_b);
drop policy if exists "conversations insert participant" on public.conversations;
create policy "conversations insert participant" on public.conversations
  for insert with check (auth.uid() = participant_a or auth.uid() = participant_b);
drop policy if exists "conversations update participant" on public.conversations;
create policy "conversations update participant" on public.conversations
  for update using (auth.uid() = participant_a or auth.uid() = participant_b)
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

drop policy if exists "cmessages select participant" on public.conversation_messages;
create policy "cmessages select participant" on public.conversation_messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
drop policy if exists "cmessages insert sender" on public.conversation_messages;
create policy "cmessages insert sender" on public.conversation_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
drop policy if exists "cmessages update participant" on public.conversation_messages;
create policy "cmessages update participant" on public.conversation_messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- New message -> bump conversation + notify the other participant (reuses public.notify).
create or replace function public.tg_notify_private_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_other uuid;
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  select case when c.participant_a = new.sender_id then c.participant_b else c.participant_a end
    into v_other
    from public.conversations c
    where c.id = new.conversation_id;
  perform public.notify(
    v_other, 'private_reply', new.sender_id, 'conversation', new.conversation_id,
    jsonb_build_object('preview', left(new.body, 120))
  );
  return new;
end; $$;
drop trigger if exists notify_on_private_reply on public.conversation_messages;
create trigger notify_on_private_reply after insert on public.conversation_messages
  for each row execute function public.tg_notify_private_reply();

-- Trigger functions are not meant to be called over the REST API.
revoke all on function public.tg_notify_private_reply() from public, anon, authenticated;
