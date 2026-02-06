# Weekly sync (cron)

The app exposes a sync route that fetches all courses from the Trackman API and upserts them into your database. It is protected by `CRON_SECRET`.

## Endpoint

- **URL**: `POST /api/sync`
- **Auth**: Required. Pass the secret via one of:
  - Header: `Authorization: Bearer <CRON_SECRET>`
  - Query: `?secret=<CRON_SECRET>`

## Running weekly on Hetzner Linux

1. Set `CRON_SECRET` in your app environment (e.g. in `.env` or your process manager).
2. Add a cron job on the server to call the sync route weekly.

Example (run every Sunday at 3:00 AM):

```bash
0 3 * * 0 curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" "https://your-domain.com/api/sync"
```

If you store the secret in a file (e.g. `/etc/tm-course-map/cron_secret`):

```bash
0 3 * * 0 curl -s -X POST -H "Authorization: Bearer $(cat /etc/tm-course-map/cron_secret)" "https://your-domain.com/api/sync"
```

Or with the secret as a query parameter (less ideal for logs):

```bash
0 3 * * 0 curl -s -X POST "https://your-domain.com/api/sync?secret=$CRON_SECRET"
```

3. Ensure `CRON_SECRET` is the same value in both your app config and the cron environment (or the file you read from).

## Manual run

You can trigger a sync manually:

```bash
curl -X POST -H "Authorization: Bearer YOUR_SECRET" "https://your-domain.com/api/sync"
```

Replace `YOUR_SECRET` with your actual `CRON_SECRET` and the host with your app URL.
