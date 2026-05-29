-- Phase 1: image gallery (up to 5) for showcase projects.
-- Cover image stays in image_url; additional screenshots live in images[].
alter table public.projects
  add column if not exists images text[] not null default '{}';

comment on column public.projects.images is 'Gallery image URLs (up to 5). Cover = image_url, falls back to images[0].';
