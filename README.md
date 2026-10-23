# Off Flame Together – Supporting Web System (EXE201)

Public landing page and protected beta-management admin dashboard for **Off Flame Together**, an offline Unity PC firefighting game prototype. The Unity project remains untouched and 100% offline.

## Live Links
1. **Public Landing Page:** `https://besofuls.github.io/off-flame-together-web/`
2. **Protected Admin Dashboard:** `https://besofuls.github.io/off-flame-together-web/#/admin`
3. **itch.io Beta Page:** `https://besofuls.itch.io/off-flame-together`

## Deliverables Index
1. **Public Landing Page:** [`src/App.tsx`](src/App.tsx), [`src/components/FeedbackForm.tsx`](src/components/FeedbackForm.tsx), [`src/content.ts`](src/content.ts) (Vietnamese & English switch).
2. **Protected Admin Dashboard & Admin Account Setup:** [`src/components/AdminDashboard.tsx`](src/components/AdminDashboard.tsx) and [`docs/ADMIN_SETUP_AND_DEPLOY.md`](docs/ADMIN_SETUP_AND_DEPLOY.md).
3. **SQL Schema / Migration & Verified Seed Data:**
   - Schema + RLS: [`supabase/migrations/20261023000001_init_schema.sql`](supabase/migrations/20261023000001_init_schema.sql)
   - Verified itch.io Historical Seed: [`supabase/seed.sql`](supabase/seed.sql)
   - Local PostgreSQL RLS Test Suite: [`supabase/tests/`](supabase/tests/)
4. **ERD & Data Dictionary:**
   - ERD (Mermaid): [`docs/ERD.md`](docs/ERD.md)
   - Data Dictionary: [`docs/DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md)
5. **Environment Variables & Deployment Instructions:** [`docs/ADMIN_SETUP_AND_DEPLOY.md`](docs/ADMIN_SETUP_AND_DEPLOY.md) and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
6. **Test Checklist:** [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md).

## Run Locally
```bash
npm install
cp .env.example .env   # set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ITCH_URL
npm run dev            # http://localhost:5173 (Admin at http://localhost:5173/#/admin)
npm run build          # TypeScript check + production build into dist/
```
