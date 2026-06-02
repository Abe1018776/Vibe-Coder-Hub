-- Trigger functions don't need to be callable via the REST API; revoke EXECUTE so the
-- security advisor is satisfied. Triggers still fire (execution doesn't require this grant).
revoke all on function public.tg_notify_upvote() from public, anon, authenticated;
revoke all on function public.tg_notify_comment() from public, anon, authenticated;
revoke all on function public.tg_notify_gig_application() from public, anon, authenticated;
revoke all on function public.tg_notify_message() from public, anon, authenticated;
revoke all on function public.tg_notify_competition_winner() from public, anon, authenticated;
revoke all on function public.tg_notify_interest() from public, anon, authenticated;
