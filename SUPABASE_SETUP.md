Click Store — Supabase setup

This project can optionally sync data to a shared Supabase database so multiple users/machines see the same inventory.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.

2) Run the SQL migration
- Open the SQL Editor in your Supabase project and paste the contents of `supabase/migrations/create_inventory_tables.sql`.
- Run the script to create the tables.

Local / reproducible setup
- If you prefer to keep everything versioned in the repo and run migrations locally (Postgres or Supabase), use the included SQL files in `supabase/migrations` and `supabase/seeds`.
- There is a helper PowerShell script at `scripts/apply-sql.ps1` that will apply all SQL files in `supabase/migrations` and then `supabase/seeds` to a Postgres connection.

Examples (PowerShell):

Set environment variables for the target DB (local Postgres):

```
$env:PGHOST='localhost'
$env:PGPORT='5432'
$env:PGUSER='postgres'
$env:PGPASSWORD='yourpwd'
$env:PGDATABASE='click_storage'
pwsh .\scripts\apply-sql.ps1
```

Or use the npm helper on Windows:

```
npm run migrate:apply
```

Notes:
- `psql` must be installed and available in PATH. On Windows install the PostgreSQL client or use the Supabase CLI to create a connection.
- The seed files are idempotent (use ON CONFLICT DO NOTHING) so you can re-run them safely.

3) Configure environment variables in your app
- Create a `.env.local` file in the project root with these variables:

VITE_REMOTE_SYNC=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key

- The `VITE_REMOTE_SYNC=true` flag enables remote sync. If not set, the app keeps using localStorage.

4) Optional: Security hardening
- For production, use Supabase Auth and Row-Level Security (RLS) policies. The project currently uses the anon key for convenience.
- Add RLS policies to protect data and allow only authenticated users to modify rows.

5) Recommended migration flow
- To avoid accidental overwrite, first open the app on one machine and confirm remote data (if any).
- If you have local data you'd like to push, I can add a "Push local to remote" button for manual migration.

6) Need help?
- I can add: SQL for migration, a "Sync now" button, Supabase Auth wiring, or RLS example policies. Tell me which you'd like next.
