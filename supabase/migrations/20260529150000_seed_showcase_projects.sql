-- Phase 7: seed real community projects. Backend-only is_seed flag for fast cleanup.
alter table public.projects add column if not exists is_seed boolean not null default false;
comment on column public.projects.is_seed is 'Backend-only: marks seeded launch content for easy bulk cleanup. Never shown in UI.';

-- Seed accounts: one community container + two named builders. Passwordless,
-- non-routable emails. The handle_new_user trigger creates their profiles.
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-a000-000000000001','authenticated','authenticated','community@seed.yidvibe.local', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"YidVibe Community","username":"yidvibe"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-a000-000000000002','authenticated','authenticated','josephlandau@seed.yidvibe.local', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Joseph Landau","username":"josephlandau"}'::jsonb),
  ('00000000-0000-0000-0000-000000000000','00000000-0000-4000-a000-000000000003','authenticated','authenticated','dicta@seed.yidvibe.local', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dicta","username":"dicta"}'::jsonb)
on conflict (id) do nothing;

update public.profiles set bio = 'Building tools to help loved ones stay connected.' where id = '00000000-0000-4000-a000-000000000002';
update public.profiles set bio = 'OCR and digitization for rabbinic texts. From Dicta / Bar-Ilan University.', links = '{"website":"https://dicta.org.il"}'::jsonb where id = '00000000-0000-4000-a000-000000000003';

insert into public.projects (owner_id, name, description, url, tools, tags, is_anonymous, is_seed) values
  ('00000000-0000-4000-a000-000000000001','Kehilla','A curated local business directory that helps community members discover, connect with, and support trusted professionals and businesses around them. Vetted listings, no ads, direct contact via WhatsApp, phone, or email.', null, '{}', '{Community,Finder,Directory,Marketplace}', true, true),
  ('00000000-0000-4000-a000-000000000001','Arrive Accidents','Local residents report accidents they witness and receive real-time alerts about incidents in their area, displayed on an interactive map color-coded by severity.', null, '{Base44,Leaflet,OpenStreetMap}', '{Community,Safety,"Civic Tech",Map}', true, true),
  ('00000000-0000-4000-a000-000000000001','Korbanos','A modern-day price calculator for the sacrificial offerings of the Jewish Temple, with prices based on current Jerusalem market rates and live silver spot prices. Estimates what individuals and the community would spend on korbanos if the Beis HaMikdash were standing today.', null, '{Claude}', '{Torah,Education,Calculator,Jewish}', true, true),
  ('00000000-0000-4000-a000-000000000002','havemeinmind.com','Allows you to manage and share your family kvittel and easily have loved ones and friends in mind by sending them a link and having them add their names.', 'https://havemeinmind.com', '{Lovable}', '{Jewish,Community,Finder}', false, true),
  ('00000000-0000-4000-a000-000000000001','Was It Vibe Coded?','A vibe-coding detector — paste any URL and it scans the site''s source code for telltale signatures of AI coding platforms like Lovable, v0, Bolt, Cursor, and Replit. A fingerprinting tool for AI-built websites.', null, '{}', '{"Developer Tools","AI Detection",SaaS}', true, true),
  ('00000000-0000-4000-a000-000000000001','GeniusBunks','Import campers, set friendship requests and constraints, and auto-generate balanced bunk groups in seconds — with a chat assistant, drag-and-drop tuning, and friend-satisfaction scoring.', null, '{}', '{SaaS,Education,AI,Automation}', true, true),
  ('00000000-0000-4000-a000-000000000001','Grocery Price Comparison','Compare prices between kosher supermarkets so you always get the best deal.', null, '{}', '{Finder,Community,Finance}', true, true),
  ('00000000-0000-4000-a000-000000000003','Dicta Maivin','OCR app specialized for rabbinic fonts; photograph any sefer page and it digitizes the text. From Dicta / Bar-Ilan University.', null, '{}', '{Torah,Education,AI}', false, true),
  ('00000000-0000-4000-a000-000000000001','The Acharonim','This interactive map visualizes the network of rabbinic scholars in Poland and their responsa correspondence from the 16th to 18th centuries. Responsa are written decisions and rulings by rabbinic authorities in response to questions on Jewish law.', null, '{}', '{Torah,Education,Jewish,Map}', true, true),
  ('00000000-0000-4000-a000-000000000001','Simcha Vendor Directory','Stop the guesswork, plan with clarity. A directory of simcha vendors with transparent cost data and real feedback.', null, '{}', '{Community,Events,Finance}', true, true);

-- CLEANUP (run manually to remove all seed content):
--   delete from public.projects where is_seed = true;
--   delete from auth.users where id in (
--     '00000000-0000-4000-a000-000000000001',
--     '00000000-0000-4000-a000-000000000002',
--     '00000000-0000-4000-a000-000000000003');
