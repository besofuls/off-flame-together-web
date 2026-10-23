# Off Flame Together – supporting web

Landing page (done) + admin dashboard (next) for the offline Unity prototype. The game itself is untouched.

## Run locally
```bash
npm install
cp .env.example .env   # fill in values (see below)
npm run dev            # http://localhost:5173
npm run build          # type-check + production build into dist/
```

## Environment variables (public values only)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon/public** key (never the service_role key) |
| `VITE_ITCH_URL` | Public itch.io page of the game (`https://besofuls.itch.io/off-flame-together`) |

If a value is missing, the page shows the itch button as "not configured" and the form reports an error instead of faking success.

## Database
1. Supabase → SQL Editor → run `supabase/migrations/20261023000001_init_schema.sql`.
2. Run `supabase/seed.sql` (imported historical itch.io analytics).
3. Docs: `docs/ERD.md`, `docs/DATA_DICTIONARY.md`.

## Images
Originals are optimized into `public/img` with `npm run images` (set `ITCH_MATERIAL_DIR` if the source folder moves).

## Deploy (GitHub Pages)
Deployment runs via `.github/workflows/deploy.yml` on every push to `main`:
1. In the GitHub repository → **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. In **Settings → Secrets and variables → Actions**, add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ITCH_URL` (under either **Variables** or **Secrets**).
3. Push to `main` (or trigger **Deploy to GitHub Pages** manually in the **Actions** tab).
4. Live URL: `https://besofuls.github.io/off-flame-together-web/`
