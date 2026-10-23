# ERD – Off Flame Together (matches `20261023000001_init_schema.sql`)

```mermaid
erDiagram
    AUTH_USERS ||--o| ADMIN_USERS : "is admin"
    BUILDS ||--o{ FEEDBACK : "about build (nullable)"
    BUILDS ||--o{ BUG_REPORTS : "about build (nullable)"
    ANALYTICS_SNAPSHOTS ||--o{ TRAFFIC_REFERRERS : "same window"

    AUTH_USERS {
        uuid id PK "managed by Supabase Auth (hashed passwords)"
    }
    ADMIN_USERS {
        uuid user_id PK, FK "-> auth.users.id, ON DELETE CASCADE"
        text email
        timestamptz created_at
    }
    BUILDS {
        uuid id PK
        text version UK
        text title
        text release_notes
        text download_url
        boolean is_published
        date released_at
        timestamptz created_at
        timestamptz updated_at
    }
    FEEDBACK {
        uuid id PK
        uuid build_id FK "ON DELETE SET NULL"
        text player_name
        text player_email
        smallint rating "1-5"
        text category
        text message
        timestamptz created_at
    }
    BUG_REPORTS {
        uuid id PK
        uuid build_id FK "ON DELETE SET NULL"
        text reporter_name
        text reporter_email
        text title
        text description
        text steps_to_reproduce
        text system_info
        text severity
        text status
        timestamptz created_at
        timestamptz updated_at
    }
    ANALYTICS_SNAPSHOTS {
        uuid id PK
        text source "itch.io | landing_page"
        text window_type "7d | 30d | all_time | custom"
        date window_start_date
        date window_end_date
        integer window_days "generated"
        date captured_on
        integer views
        integer unique_views
        integer downloads
        text data_origin "imported_itch_historical | manual_entry"
        text notes
        timestamptz created_at
    }
    TRAFFIC_REFERRERS {
        uuid id PK
        uuid snapshot_id FK "ON DELETE CASCADE"
        text referrer
        integer views
        timestamptz created_at
    }
```

**Design note:** `traffic_referrers` is a child of `analytics_snapshots`, so every referrer
figure inherits an explicit date window. Public visitors cannot write to it.
