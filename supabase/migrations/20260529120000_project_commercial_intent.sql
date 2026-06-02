-- Phase 3: optional commercial-intent flags on a project (badges + filters).
alter table public.projects
  add column if not exists seeking_funding boolean not null default false,
  add column if not exists for_sale boolean not null default false,
  add column if not exists open_to_partners boolean not null default false;

comment on column public.projects.seeking_funding is 'Builder is looking for investment for this project.';
comment on column public.projects.for_sale is 'The whole product is for sale to a buyer.';
comment on column public.projects.open_to_partners is 'Looking for partners / co-founders, not just money.';
