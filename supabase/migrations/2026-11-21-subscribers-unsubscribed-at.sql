-- Subscribers: soft unsubscribe (email nizam, 2026-11-21).
--
-- Adds unsubscribed_at to public.subscribers so leaving the email
-- list is a MARK, not a delete: the row stays, the admin panel shows
-- the address as "Unsubscribed", and the admin can reactivate it
-- later from the panel. NULL means the address is on the list
-- (status "Confirmed" — signup is single opt-in, confirmed at once).
--
-- Idempotent: safe to run more than once. No existing rows change —
-- every current subscriber simply reads as Confirmed (NULL).
--
-- Apply ONCE in the Supabase dashboard SQL editor for the UK Payroll
-- Calculators project (zrwssbvlettgrcfdwxsw) BEFORE or together with
-- the 23 Nov 2026 deployment. The site code degrades gracefully until
-- this runs (unsubscribe falls back to the old delete behaviour and
-- the admin page falls back to reading without the column).

alter table public.subscribers
  add column if not exists unsubscribed_at timestamptz;
