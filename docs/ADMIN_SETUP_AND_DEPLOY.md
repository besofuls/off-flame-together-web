# Admin Account Setup, Environment Configuration & Deployment Guide

## 1. URLs
- **Public Landing Page URL:** `https://besofuls.github.io/off-flame-together-web/`
- **Protected Admin Dashboard URL:** `https://besofuls.github.io/off-flame-together-web/#/admin`
  *(Also accessible via `https://besofuls.github.io/off-flame-together-web/admin` or the **Admin Dashboard →** link in the page footer).*

---

## 2. How to Create a Dedicated Application Admin Account

Passwords are **never** stored in application tables; authentication is handled by **Supabase Auth** (`auth.users`, bcrypt-hashed) and admin authorization is controlled by `public.admin_users` + the `public.is_admin()` `SECURITY DEFINER` function.

### Step 1: Create the user in Supabase Auth
1. Open your Supabase project dashboard → **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter a dedicated admin email (e.g. `admin@offflametogether.dev`) and a strong password, check **Auto Confirm User**, and click **Create user**.
4. Copy the generated **User UID** (or sign in on `/#/admin` — the 403 screen will display your exact UID and the SQL command ready to copy).

### Step 2: Grant Admin role in `public.admin_users`
1. Open **SQL Editor → New query** in the Supabase dashboard.
2. Run:
   ```sql
   insert into public.admin_users (user_id, email)
   values ('<USER_UID_FROM_AUTH>', '<ADMIN_EMAIL>');
   ```
3. Return to `https://besofuls.github.io/off-flame-together-web/#/admin` and click **Kiểm tra lại quyền / Re-check privileges** (or sign in). The Admin Dashboard will load.

---

## 3. Environment Variables Configuration

Only **public** client variables are used by the Vite frontend. **Never** place the Supabase `service_role` secret key or database password in `.env` or frontend code.

| Variable | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://sklawpbaxfqlcyfpanbi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public `anon` / publishable key (enforced by RLS) | `eyJhbGciOi...` |
| `VITE_ITCH_URL` | Public itch.io beta page | `https://besofuls.itch.io/off-flame-together` |

### Local development (`.env`)
1. Copy `.env.example` to `.env` (UTF-8 without BOM):
   ```ini
   VITE_ITCH_URL=https://besofuls.itch.io/off-flame-together
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
   ```
2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
   *(Restart `npm run dev` whenever `.env` is modified).*

---

## 4. Database Setup & Seed Migration

1. In Supabase → **SQL Editor**, run [`supabase/migrations/20261023000001_init_schema.sql`](../supabase/migrations/20261023000001_init_schema.sql) to create all tables, constraints, triggers, and Row Level Security (RLS) policies.
2. Run [`supabase/seed.sql`](../supabase/seed.sql) to import the verified historical itch.io 30-day analytics snapshot (`2026-09-24` to `2026-10-23`, labeled `imported_itch_historical`) and its traffic referrers.

---

## 5. Deployment (GitHub Pages via GitHub Actions)

Deployment is automated by [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):
1. In GitHub repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. In **Settings → Secrets and variables → Actions**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ITCH_URL` (optional; defaults to `https://besofuls.itch.io/off-flame-together`)
3. Push to `main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions runs `npm ci && npm run build`, copies `dist/index.html` to `dist/404.html` for SPA routing, and deploys to `https://besofuls.github.io/off-flame-together-web/`.
