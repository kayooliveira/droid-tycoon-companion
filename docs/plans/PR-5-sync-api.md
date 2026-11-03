# PR 5 (planned): optional sync API (Coolify)

Layers on PR 4 offline-first. The PWA must remain **100% functional with zero API**; sync is opt-in and best-effort when online.

## API sketch (2–5 lines)

Hono (or Fastify) service in `/api`: `GET /health`, `POST /v1/devices` (issue anonymous device + sync secret), `GET /v1/sync?since=` (pull changed records), `PUT /v1/sync` (push record batch with `id`, `kind`, `payload`, `updatedAt`). PostgreSQL stores one row per logical record; **last-write-wins** using monotonic `updatedAt` (client clock skew tolerated with server `receivedAt` audit only). Rate limits per IP and per sync token; Zod validation on all bodies.

## Assumed database

- **Engine:** PostgreSQL **16** (Coolify shared instance; dedicated DB user, least privilege).
- **Connection:** `DATABASE_URL` only (never committed).

## Planned migrations (Drizzle or SQL)

1. `devices` — `id` (uuid), `sync_secret_hash`, `created_at`, `last_seen_at`
2. `sync_records` — `device_id`, `record_key` (text), `kind` (text), `payload` (jsonb), `updated_at` (timestamptz), PK `(device_id, record_key)` or separate `id` with unique `(device_id, record_key)`
3. Optional `sync_ops` — append-only op log if we outgrow pure LWW (PR 5 can start with LWW only)

## Endpoints (draft)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness + DB ping |
| POST | `/v1/devices` | Create anonymous device; returns `deviceId` + one-time `syncCode` (store hash server-side) |
| POST | `/v1/devices/claim` | Link second device using sync code (rotate secret) |
| GET | `/v1/sync` | Query `?since=<iso>` — records for this device/account updated after `since` |
| PUT | `/v1/sync` | Body: `{ records: [{ key, kind, payload, updatedAt }] }` — upsert with LWW |
| DELETE | `/v1/sync` | Optional: wipe server copy (user-initiated from app) |

## Client integration (after offline-first)

- IndexedDB remains source of truth locally; background sync when `navigator.onLine` and user enabled sync.
- Export/import file backup unchanged.
- Conflict UI only if LWW would drop local edits (rare if single-writer per device); optional “keep local / keep server” later.

## Repo layout (PR 5)

- `/api` — Node 22, TypeScript, Dockerfile
- `.github/workflows/api-docker.yml` — build + push `ghcr.io/kayooliveira/droid-tycoon-companion-api:current` (and `:sha`)

## Env vars (for Coolify; PR 5 description will repeat exactly)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | Postgres connection string |
| `PORT` | no | Default `3000` |
| `NODE_ENV` | no | `production` |
| `SYNC_RATE_LIMIT_PER_MIN` | no | Default e.g. `60` |
| `CORS_ORIGIN` | yes | PWA origin(s), comma-separated |

No secrets in repo. Kayo provisions DB user and Coolify app.

## Redesign sequence

1. Design system (#18)  
2. Reimagined screens  
3. Onboarding  
4. Real offline-first  
5. **This API** (optional sync)
