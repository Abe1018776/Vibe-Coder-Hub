-- Launch content cleanup: remove the seeded/demo showcase projects, keeping only
-- the genuinely-real ones. The demos were created under the seed accounts
-- 'yidvibe' and 'dicta'; real projects belong to real builder accounts.
--
-- KEEP (real): Kehilla + "The Acharonim — Interactive Rabbinic Map" (elimelechmoster),
--              havemeinmind.com (josephlandau).
-- DELETE: the 8 anonymous demos + 2 duplicates under 'yidvibe', and "Dicta Maivin"
--         under 'dicta'.
--
-- Pending owner confirmation of the exact names before this is applied.

delete from upvotes where project_id in (
  select p.id from projects p
  join profiles pr on pr.id = p.owner_id
  where pr.handle in ('yidvibe', 'dicta')
);

delete from comments where project_id in (
  select p.id from projects p
  join profiles pr on pr.id = p.owner_id
  where pr.handle in ('yidvibe', 'dicta')
);

delete from projects where owner_id in (
  select id from profiles where handle in ('yidvibe', 'dicta')
);
