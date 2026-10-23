-- =====================================================================
-- Seed: IMPORTED HISTORICAL itch.io analytics (verified from the itch.io
-- dashboard screenshot, captured 2026-10-23).
-- Window: 2026-09-24 .. 2026-10-23 (itch.io "Last 30 days", 30 days inclusive).
-- Figures are copied as shown; nothing is estimated.
--  * unique_views is NULL: itch.io did not show it.
--  * The dashboard also showed "7d Impressions 71" and "CTR 5.63%".
--    These have no explicit date range, so they are kept in notes only and
--    are NOT stored as a 7d window row.
--  * Referrers come from "Incoming visits from other sites over the past
--    30 days" (By URL). Two rows were truncated in the UI
--    (".../platform-windows?ysc..."); they are merged by path (1 + 1 = 2).
--  * One referrer (chat.zalo.me, 2 visits) was intentionally omitted at the
--    team's request (messaging-app source). Listed referrers therefore sum
--    to 12 of the 14 incoming visits shown by itch.io.
-- =====================================================================

with snap as (
  insert into public.analytics_snapshots
    (source, window_type, window_start_date, window_end_date, captured_on,
     views, unique_views, downloads, data_origin, notes)
  values
    ('itch.io', '30d', date '2026-09-24', date '2026-10-23', date '2026-10-23',
     62, null, 18,
     'imported_itch_historical',
     'Imported historical analytics from itch.io dashboard (Last 30 days, 24/09/2026-23/10/2026). '
     || 'Dashboard also showed 7d Impressions = 71 and CTR = 5.63% (no explicit date range). '
     || 'Ratings 0, collections 0, comments 0. File OffFlameTogether_Build_20261015.zip: 18 downloads. '
     || 'Referrer list omits 1 source (2 visits) at the team''s request.')
  returning id
)
insert into public.traffic_referrers (snapshot_id, referrer, views)
select snap.id, v.referrer, v.views
from snap, (values
  ('https://itch.io/search?q=off+flame+together', 5),
  ('https://itch.io/games/newest', 2),
  ('https://besofuls.itch.io/', 1),
  ('https://www.google.com/', 1),
  ('https://itch.io/games/new-and-popular/free/genre-simulation/platform-windows (query truncated in UI; 2 entries merged)', 2),
  ('https://itch.io/', 1)
) as v(referrer, views);
