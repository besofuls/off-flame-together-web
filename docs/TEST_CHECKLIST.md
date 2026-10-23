# Test Checklist – Off Flame Together Supporting Web System

This checklist covers all 6 required verification areas: mobile layout, public feedback submission, admin login, data persistence, authorization (RLS), and admin data management.

## 1. Mobile Layout & Responsiveness
- [x] **Mobile viewport (`390×844`):** Open `/` on a 390px screen; verify `document.documentElement.scrollWidth === document.documentElement.clientWidth` (`0px` horizontal overflow).
- [x] **Hero & CTA buttons on mobile:** Verify title, description, "Tải bản beta trên itch.io" (`https://besofuls.itch.io/off-flame-together`), and "Gửi góp ý" stack full-width and remain clickable.
- [x] **Feature cards & Team grid:** Verify the 5 prototype features (Movement, Water Hose, Hidden Fire HP, Demo Map, Win/Lose Conditions) and 6-member Team grid stack cleanly into 1 column on `<520px`, 2 columns on `520–820px`, and 3 columns on desktop.
- [x] **Bilingual switch (`VI | EN`):** Click `VI | EN` in the top navigation bar; verify all headings, feature descriptions, form labels, and validation errors switch between Vietnamese and English and persist across page reloads.

## 2. Public Feedback & Bug Report Submission
- [x] **Feedback validation:** Attempt to submit Feedback with 0 stars selected; verify client validation blocks submission and displays an error alert.
- [x] **Feedback submission (`POST /rest/v1/feedback`):** Select a 1–5 star rating, choose a topic, enter a message, and click submit; verify HTTP `201 Created` from Supabase and the confirmation notice appears.
- [x] **Bug report submission (`POST /rest/v1/bug_reports`):** Switch to the "Báo lỗi / Bug report" tab, fill in Title, Description, Steps to reproduce, Severity, and System specs, and submit; verify HTTP `201 Created` and status defaults to `'open'`.

## 3. Admin Login & Authentication
- [x] **Unauthenticated protection:** Navigate to `/#/admin` while signed out; verify only the "Đăng nhập Quản trị Beta / Beta Admin Sign In" form is rendered and no admin data is fetched.
- [x] **Invalid credentials rejection:** Enter an invalid email/password on `/#/admin`; verify Supabase Auth rejects sign-in (`Invalid login credentials`) and displays an error banner.
- [x] **Valid admin sign-in & sign-out:** Sign in with an account listed in `public.admin_users`; verify the Admin Dashboard loads and clicking "Đăng xuất / Sign out" clears the session and returns to the login screen.

## 4. Data Persistence
- [x] **Database constraints & triggers:** Verified on PostgreSQL 15 (`supabase/tests/10_authz_tests.sql`) and live Supabase (`sklawpbaxfqlcyfpanbi.supabase.co`):
  - Ratings outside `1..5` are rejected by `feedback_rating_check`.
  - `analytics_snapshots` with `window_type = '7d'` spanning ≠ 7 days (or `'30d'` spanning ≠ 30 days) are rejected by `chk_window_length`.
  - Updating a row in `builds` or `bug_reports` automatically advances `updated_at` via trigger `set_updated_at()`.
- [x] **Seeded historical analytics:** Verified `supabase/seed.sql` inserts 1 `analytics_snapshots` row (`source='itch.io'`, `window_type='30d'`, `2026-09-24` to `2026-10-23`, `window_days=30`, `views=62`, `downloads=18`, `data_origin='imported_itch_historical'`) and 6 linked `traffic_referrers` rows.

## 5. Authorization & Row Level Security (RLS)
- [x] **Anonymous visitor (`anon` role) blocked from private reads/writes:**
  - `GET /rest/v1/feedback` → HTTP `401` (`permission denied for table feedback`)
  - `GET /rest/v1/bug_reports` → HTTP `401` (`permission denied for table bug_reports`)
  - `GET /rest/v1/analytics_snapshots` → HTTP `401` (`permission denied for table analytics_snapshots`)
  - `GET /rest/v1/traffic_referrers` → HTTP `401` (`permission denied for table traffic_referrers`)
  - `GET /rest/v1/admin_users` → HTTP `401` (`permission denied for table admin_users`)
  - `GET /rest/v1/builds` → HTTP `200`, returns only rows where `is_published = true`
  - `INSERT` into `bug_reports` with `status = 'closed'` → rejected (column privilege + RLS `with check (status = 'open')`).
- [x] **Authenticated non-admin user blocked:**
  - Signed-in user not present in `public.admin_users` receives `is_admin() = false`, sees 0 rows in `feedback`, `bug_reports`, `analytics_snapshots`, `admin_users`, cannot update bug status (`UPDATE 0`), cannot self-insert into `admin_users`, and is shown the 403 Access Denied screen in `/#/admin`.

## 6. Admin Data Management
- [x] **Summary counts:** Verify top cards display total Feedback + average star rating, Bug Reports breakdown (`open` / `in_progress` / `resolved`), Build Versions count, and Analytics Snapshots count.
- [x] **Update bug report status:** Change a bug report's status dropdown (`open` → `in_progress` → `resolved` → `closed`) or severity; verify `PATCH /rest/v1/bug_reports` succeeds and updates the badge and `updated_at` timestamp.
- [x] **Manage build metadata:** Create a new build version (`version`, `title`, `download_url`, `released_at`, `release_notes`, `is_published`), edit an existing build, and toggle publication status; verify published builds appear in the public feedback form's optional build selector.
- [x] **Analytics snapshots & referrers:** Verify seeded itch.io 30-day snapshot displays the **"IMPORTED HISTORICAL ANALYTICS (VERIFIED ITCH.IO)"** badge, explicit window (`2026-09-24 → 2026-10-23`, 30 days), `N/A` for unreported `unique_views`, and its traffic referrers table.
