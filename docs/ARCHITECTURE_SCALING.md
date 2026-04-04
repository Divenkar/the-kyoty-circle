# Kyoty — Architecture Scaling Guide

> Written for the engineering team. This document describes the concrete changes needed at each growth stage.

---

## Current State (0 → 10K users)

**Stack:** Next.js 15 App Router · Supabase (Postgres + Auth + Realtime) · Vercel · React Native/Expo

This is the right stack for the current stage. Supabase handles auth, database, storage, and realtime. Vercel handles CDN, serverless, and edge.

**Bottlenecks to fix NOW (before any marketing spend):**
- Add indexes (migration 016) — done.
- Enforce per-query `limit()` on all repository calls — done.
- Fix `USING (true)` RLS policies to filter at the DB level — done (migration 023).
- Add `unstable_cache` on high-traffic read paths (explore, communities) — done.
- **Connection pooling note:** All queries go through `@supabase/supabase-js` (PostgREST API), not direct Postgres connections. PostgREST has its own connection pool managed by Supabase. Direct pooling (Supavisor port 6543) is only needed if you add direct Postgres access (e.g., Prisma, Drizzle, or background job workers). Not required at current scale.

---

## Stage 1: 100K Users

### When you need it
Around 5–10K DAU, or when Vercel function cold-start p99 > 500ms.

### Database
- **Connection pooling:** Switch from direct Supabase client to **PgBouncer** (Supabase's built-in pooler, transaction mode). Each serverless invocation currently opens a new connection. At 100K users this will exhaust Postgres's connection limit (~100 on free, ~500 on Pro).
  ```
  # Change the Supabase client URL to the pooler URL:
  DATABASE_URL=postgres://...@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- **Materialized counts:** `communities.member_count` is already a column. Ensure it is updated via trigger (migration 007) and never calculated in-app. Same for `events.registered_count`.
- **Partial indexes:** Add `WHERE status = 'approved'` partial index on `community_members` and `WHERE status IN ('open','approved')` on `events` — reduces index size by 10x for the common query path.

### Caching layer
- Use Next.js `unstable_cache` (or `cache` in 15) on:
  - `/communities` page data (revalidate every 60s)
  - `/explore` event list (revalidate every 30s)
  - Individual community pages (revalidate on membership change)
- Use Vercel's **Edge Config** for feature flags and city-availability without DB round-trips.

### Storage
- Enable Supabase Storage CDN (already available on Pro). All cover image URLs should point to the CDN, not the raw storage URL.
- Add `width` and `quality` params to `next/image` for every cover image. Use `sizes` correctly.

### Search
- Replace substring `ilike` with Postgres **full-text search** using `tsvector` columns:
  ```sql
  ALTER TABLE communities ADD COLUMN search_vector tsvector
      GENERATED ALWAYS AS (
          to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))
      ) STORED;
  CREATE INDEX idx_communities_search ON communities USING gin(search_vector);
  ```
- Query: `.textSearch('search_vector', query, { type: 'websearch' })`

### Mobile
- Add proper **push notification** support via Expo Notifications + a Supabase Edge Function that sends notifications on membership approval, event reminder (24h before), and waitlist promotion.
- Replace mock event data with real Supabase queries directly from the mobile app (bypass the Next.js API layer for read-only queries — mobile can talk to Supabase directly).

---

## Stage 2: 1M Users

### When you need it
Around 50K DAU, or when Supabase Postgres CPU > 60% average.

### Database architecture
- **Read replicas:** Supabase Pro supports read replicas. Route all SELECT queries (explore, community list, event detail) to the replica. Only writes (join, RSVP, chat) go to primary.
  ```typescript
  // Read client
  const readSupabase = createClient(process.env.SUPABASE_READ_URL, key);
  // Write client
  const writeSupabase = createClient(process.env.SUPABASE_URL, key);
  ```
- **Denormalization for hot paths:** Store `event_participant_count` on the `events` table (already exists as `registered_count`) and update via trigger. Stop doing `COUNT(*)` queries on event detail pages.
- **Chat pagination:** The community chat page must load messages in pages of 50. Add cursor-based pagination (`created_at < :cursor`). Without this, communities with 10K messages will time out.

### Caching
- Add **Redis** (Upstash) for:
  - Session-level caching of `getCurrentUser()` results (currently hits DB on every server request)
  - Rate limiting (replace in-memory state with Redis counters)
  - Distributed locks for waitlist promotion (prevent double-promotion race condition)
  ```typescript
  // Cache user profile for 5 minutes per session
  const cached = await redis.get(`user:${authId}`);
  if (cached) return JSON.parse(cached);
  ```
- Cache explore/communities API responses at the Vercel Edge level with `Cache-Control: s-maxage=30, stale-while-revalidate=60`.

### Auth
- Implement proper **rate limiting** on auth endpoints using Upstash Redis (sliding window, 5 attempts per 15 min per IP).
- Move from Supabase's default email provider to **Resend** or **Postmark** for transactional email (approval decisions, reminders). Supabase's built-in email is rate-limited to 4/hr on free.

### Event notifications (retention)
Build a Supabase **Edge Function** (Deno) triggered by pg_cron:
```sql
-- Run at 9 AM every day
SELECT cron.schedule('event-reminders', '0 9 * * *', $$
    SELECT net.http_post('https://your-app.supabase.co/functions/v1/send-event-reminders', '{}')
$$);
```
The function queries upcoming events in the next 24 hours and sends emails/pushes to registered participants.

### Payments
- Add a `payment_intents` table linking Razorpay orders to users before payment (not after). This lets you recover failed payments.
- Implement webhook retry dead-letter queue — log all webhook attempts and re-process failed ones.

### Infrastructure
- Move from Vercel Hobby to **Vercel Pro** (removes function execution limits).
- Enable **Vercel Analytics** + **Speed Insights** for real performance data.
- Add **Sentry** for error tracking: `npm install @sentry/nextjs`.
- Set `NEXT_PUBLIC_SENTRY_DSN` and wrap `instrumentation.ts`.

---

## Stage 3: 10M Users

### When you need it
This is a different class of problem — at this scale you're a funded company with a dedicated infra team.

### Database
- **Shard by city.** Kyoty's data is naturally partitioned by city. Use Postgres **table partitioning** on `events` and `community_members` by `city_id`. Each city partition fits in memory and index scans stay fast.
- **Separate OLAP from OLTP.** Move analytics (event views, RSVP funnels, cohort retention) to a separate warehouse — **BigQuery** or **Clickhouse** via Supabase's logical replication. Stop running `GROUP BY` queries on your production DB.
- Migrate from Supabase managed Postgres to **AWS RDS Aurora Postgres** or **Neon** with autoscaling for cost efficiency at high load.

### Application layer
- Extract the following into dedicated **microservices** or **Supabase Edge Functions**:
  - Notification service (email, push, in-app)
  - Payment service (Razorpay webhook processing, refunds)
  - Search service (Typesense or Elasticsearch for multi-city, multi-category search with typo tolerance)
  - Chat service (consider **Ably** or **Pusher** instead of Supabase Realtime at this scale)
- Use a **message queue** (Upstash QStash or AWS SQS) for async operations: image processing, email delivery, notification fanout.

### CDN & media
- Move all image uploads to **Cloudflare R2** + **Cloudflare Images** for automatic resizing, format conversion (WebP/AVIF), and CDN delivery at zero egress cost.
- Generate **OG image cards** at the edge using `@vercel/og` for every event and community. These are your viral distribution mechanism.

### Mobile
- Publish to App Store and Play Store (the Expo project is ready for EAS build).
- Add **Expo OTA updates** so you can push bug fixes without App Store review.
- Implement **offline-first** for the discovery feed using React Query + MMKV persistence.

### Observability
- **OpenTelemetry** tracing across all API routes and server actions.
- **Grafana** dashboards for DB query latency, connection pool usage, API p50/p99.
- **PagerDuty** alerts for: payment webhook failures, DB connection pool exhaustion, auth error rate spikes.

---

## Migration Priority Table

| Change | Stage | Effort | Impact |
|--------|-------|--------|--------|
| Connection pooler (PgBouncer) | 100K | 1 day | Critical |
| Read replica routing | 1M | 3 days | High |
| Redis for rate limiting + session cache | 1M | 2 days | High |
| Resend for transactional email | 100K | 1 day | High |
| Full-text search (tsvector) | 100K | 1 day | Medium |
| Event reminder Edge Function | 100K | 2 days | High (retention) |
| OG image share cards | Any | 1 day | High (growth) |
| Cloudflare R2 + Images | 1M | 2 days | Medium |
| Shard by city | 10M | 2 weeks | Critical at that scale |
| Microservices extraction | 10M | 6 months | Critical at that scale |
