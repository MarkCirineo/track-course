# Fix migration history after squashing 3 migrations into one

Do this **only** if you already applied the three old migrations and want Prisma to treat the new combined migration as applied.

## 1. Remove old migration folders (if they still exist)

Delete these **folders** (they should be empty or missing):

- `prisma/migrations/20250213000000_add_tee_course_tee_index_unique/`
- `prisma/migrations/20250214000000_add_course_sync_fingerprint/`
- `prisma/migrations/20250215000000_backfill_course_sync_keys/`

## 2. Remove the three old migration records from the DB

Run this in your PostgreSQL client (psql, pgAdmin, etc.):

```sql
DELETE FROM "_prisma_migrations"
WHERE "migration_name" IN (
  '20250213000000_add_tee_course_tee_index_unique',
  '20250214000000_add_course_sync_fingerprint',
  '20250215000000_backfill_course_sync_keys'
);
```

## 3. Mark the new combined migration as applied (without running it)

From the project root:

```bash
npx prisma migrate resolve --applied "20250213000000_add_tee_unique_and_course_sync_fingerprint"
```

Or with dotenv:

```bash
npx dotenv -e .env -- npx prisma migrate resolve --applied "20250213000000_add_tee_unique_and_course_sync_fingerprint"
```

That inserts a row into `_prisma_migrations` for the new migration and records it as applied, so Prisma will not run its SQL again.

## 4. Check

```bash
npx prisma migrate status
```

You should see something like “Database schema is up to date.”
