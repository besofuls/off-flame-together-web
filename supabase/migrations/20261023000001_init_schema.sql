-- =====================================================================
-- Off Flame Together - supporting web system
-- Migration 0001: core schema + Row Level Security
-- Target: Supabase (PostgreSQL 15+, Supabase Auth)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: keep updated_at current
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. admin_users  (who is an application admin)
--    Passwords live ONLY in Supabase Auth (auth.users, hashed with bcrypt).
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can check admin status without
-- exposing admin_users to normal users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. builds
-- ---------------------------------------------------------------------
create table public.builds (
  id            uuid primary key default gen_random_uuid(),
  version       text not null unique check (char_length(version) between 1 and 40),
  title         text check (char_length(title) <= 120),
  release_notes text check (char_length(release_notes) <= 5000),
  download_url  text check (download_url ~* '^https?://'),
  is_published  boolean not null default false,
  released_at   date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_builds_updated_at
  before update on public.builds
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. feedback
-- ---------------------------------------------------------------------
create table public.feedback (
  id           uuid primary key default gen_random_uuid(),
  build_id     uuid references public.builds (id) on delete set null,
  player_name  text check (char_length(player_name) <= 80),
  player_email text check (char_length(player_email) <= 254
                           and player_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  rating       smallint not null check (rating between 1 and 5),
  category     text not null default 'general'
               check (category in ('general','gameplay','controls','visuals','audio','difficulty','other')),
  message      text not null check (char_length(message) between 1 and 2000),
  created_at   timestamptz not null default now()
);
create index idx_feedback_build_id   on public.feedback (build_id);
create index idx_feedback_created_at on public.feedback (created_at desc);

-- ---------------------------------------------------------------------
-- 4. bug_reports
-- ---------------------------------------------------------------------
create table public.bug_reports (
  id                 uuid primary key default gen_random_uuid(),
  build_id           uuid references public.builds (id) on delete set null,
  reporter_name      text check (char_length(reporter_name) <= 80),
  reporter_email     text check (char_length(reporter_email) <= 254
                             and reporter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  title              text not null check (char_length(title) between 1 and 150),
  description        text not null check (char_length(description) between 1 and 3000),
  steps_to_reproduce text check (char_length(steps_to_reproduce) <= 3000),
  system_info        text check (char_length(system_info) <= 500),
  severity           text not null default 'medium'
                     check (severity in ('low','medium','high','critical')),
  status             text not null default 'open'
                     check (status in ('open','in_progress','resolved','closed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_bug_reports_build_id on public.bug_reports (build_id);
create index idx_bug_reports_status   on public.bug_reports (status);

create trigger trg_bug_reports_updated_at
  before update on public.bug_reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. analytics_snapshots
--    One row = one metric set for ONE explicit window.
--    7-day and 30-day figures are always separate rows.
-- ---------------------------------------------------------------------
create table public.analytics_snapshots (
  id                uuid primary key default gen_random_uuid(),
  source            text not null check (source in ('itch.io','landing_page')),
  window_type       text not null check (window_type in ('7d','30d','all_time','custom')),
  window_start_date date not null,
  window_end_date   date not null,
  window_days       integer generated always as (window_end_date - window_start_date + 1) stored,
  captured_on       date not null default current_date,
  views             integer check (views >= 0),
  unique_views      integer check (unique_views >= 0),
  downloads         integer check (downloads >= 0),
  data_origin       text not null
                    check (data_origin in ('imported_itch_historical','manual_entry')),
  notes             text check (char_length(notes) <= 1000),
  created_at        timestamptz not null default now(),
  constraint chk_window_order check (window_end_date >= window_start_date),
  constraint chk_window_length check (
    (window_type = '7d'  and window_end_date - window_start_date + 1 = 7) or
    (window_type = '30d' and window_end_date - window_start_date + 1 = 30) or
    window_type in ('all_time','custom')
  ),
  constraint uq_snapshot_window unique (source, window_type, window_start_date, window_end_date, data_origin)
);
create index idx_analytics_window_end on public.analytics_snapshots (window_end_date desc);

-- ---------------------------------------------------------------------
-- 6. traffic_referrers  (child of analytics_snapshots => same window)
-- ---------------------------------------------------------------------
create table public.traffic_referrers (
  id          uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.analytics_snapshots (id) on delete cascade,
  referrer    text not null check (char_length(referrer) between 1 and 200),
  views       integer not null check (views >= 0),
  created_at  timestamptz not null default now(),
  constraint uq_referrer_per_snapshot unique (snapshot_id, referrer)
);
create index idx_traffic_referrers_snapshot on public.traffic_referrers (snapshot_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.admin_users         enable row level security;
alter table public.builds              enable row level security;
alter table public.feedback            enable row level security;
alter table public.bug_reports         enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.traffic_referrers   enable row level security;

-- Start from zero privileges, then grant only what is needed.
revoke all on public.admin_users, public.builds, public.feedback, public.bug_reports,
              public.analytics_snapshots, public.traffic_referrers
  from anon, authenticated;

-- Public visitors (anon): read published builds, submit feedback/bugs. Nothing else.
grant select on public.builds to anon, authenticated;
grant insert (build_id, player_name, player_email, rating, category, message)
  on public.feedback to anon, authenticated;
grant insert (build_id, reporter_name, reporter_email, title, description,
              steps_to_reproduce, system_info, severity)
  on public.bug_reports to anon, authenticated;

-- Signed-in users: table privileges are needed for admin policies to apply.
-- Policies below restrict every one of these to is_admin().
grant select, insert, update, delete on public.builds              to authenticated;
grant select, update, delete          on public.feedback            to authenticated;
grant select, update, delete          on public.bug_reports         to authenticated;
grant select, insert, update, delete on public.analytics_snapshots to authenticated;
grant select, insert, update, delete on public.traffic_referrers   to authenticated;
grant select                          on public.admin_users         to authenticated;

-- admin_users: admins can read; writes only via SQL editor / service role.
create policy admin_users_select_admin on public.admin_users
  for select to authenticated using (public.is_admin());

-- builds
create policy builds_select_published on public.builds
  for select to anon, authenticated using (is_published = true);
create policy builds_admin_all on public.builds
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- feedback: public insert only; admin read/update/delete
create policy feedback_insert_public on public.feedback
  for insert to anon, authenticated with check (true);
create policy feedback_admin_select on public.feedback
  for select to authenticated using (public.is_admin());
create policy feedback_admin_update on public.feedback
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy feedback_admin_delete on public.feedback
  for delete to authenticated using (public.is_admin());

-- bug_reports: public insert (status forced to 'open'); admin read/update/delete
create policy bug_reports_insert_public on public.bug_reports
  for insert to anon, authenticated with check (status = 'open');
create policy bug_reports_admin_select on public.bug_reports
  for select to authenticated using (public.is_admin());
create policy bug_reports_admin_update on public.bug_reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy bug_reports_admin_delete on public.bug_reports
  for delete to authenticated using (public.is_admin());

-- analytics_snapshots / traffic_referrers: admin only
create policy analytics_admin_all on public.analytics_snapshots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy referrers_admin_all on public.traffic_referrers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
