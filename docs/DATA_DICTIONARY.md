# Data Dictionary

All tables are in schema `public`, RLS enabled. Anon = public visitor; Admin = user listed in `admin_users`.

## admin_users
| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | uuid | PK, FK → auth.users(id) cascade | Supabase Auth account granted admin rights |
| email | text | NOT NULL | Admin email (informational) |
| created_at | timestamptz | default now() | |

Access: Admin SELECT only. Rows are added via SQL editor. No passwords stored here.

## builds
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK | |
| version | text | UNIQUE, NOT NULL | e.g. `0.1.0-beta` |
| title | text | ≤120 | |
| release_notes | text | ≤5000 | |
| download_url | text | must start with http(s):// | itch.io link |
| is_published | boolean | default false | Visible to public when true |
| released_at | date | | |
| created_at / updated_at | timestamptz | updated_at via trigger | |

Access: Anon SELECT published only; Admin full.

## feedback
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK | |
| build_id | uuid | FK → builds, SET NULL | Build the player tested (optional) |
| player_name | text | ≤80, optional | |
| player_email | text | valid format, optional | |
| rating | smallint | NOT NULL, 1–5 | |
| category | text | enum: general, gameplay, controls, visuals, audio, difficulty, other | |
| message | text | NOT NULL, 1–2000 | |
| created_at | timestamptz | default now() | |

Access: Anon INSERT only (no read-back); Admin SELECT/UPDATE/DELETE.

## bug_reports
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK | |
| build_id | uuid | FK → builds, SET NULL | |
| reporter_name / reporter_email | text | optional | |
| title | text | NOT NULL, ≤150 | |
| description | text | NOT NULL, ≤3000 | |
| steps_to_reproduce | text | ≤3000 | |
| system_info | text | ≤500 | PC specs (optional) |
| severity | text | low, medium, high, critical (default medium) | |
| status | text | open, in_progress, resolved, closed (default open) | Admin-updatable |
| created_at / updated_at | timestamptz | updated_at via trigger | |

Access: Anon INSERT only, status forced to `open`; Admin SELECT/UPDATE/DELETE.

## analytics_snapshots
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK | |
| source | text | itch.io, landing_page | Where the metric comes from |
| window_type | text | 7d, 30d, all_time, custom | Declared window |
| window_start_date / window_end_date | date | NOT NULL, end ≥ start | Explicit window |
| window_days | integer | generated (end − start + 1) | Must be 7 for `7d`, 30 for `30d` |
| captured_on | date | default today | Date the numbers were read |
| views, unique_views, downloads | integer | ≥0, nullable | Metrics (null = not available) |
| data_origin | text | imported_itch_historical, manual_entry | Labels imported data |
| notes | text | ≤1000 | |
| created_at | timestamptz | | |

Unique per (source, window_type, start, end, data_origin). Access: Admin only.

## traffic_referrers
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | PK | |
| snapshot_id | uuid | FK → analytics_snapshots, CASCADE | Window these referrer counts belong to |
| referrer | text | NOT NULL, ≤200 | e.g. `facebook.com` |
| views | integer | ≥0 | |
| created_at | timestamptz | | |

Unique per (snapshot_id, referrer). Access: Admin only.
