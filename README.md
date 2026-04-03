# Kyoty

City-first community event discovery platform. Find and join local events, connect with communities, and manage group experiences.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Auth | Clerk (sign-up, sign-in, Google OAuth, JWT) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Payments | Razorpay |
| Email | Resend |
| Mobile | React Native (Expo) |
| Deployment | Docker / Vercel |

---

## Features

- Browse and discover events by city
- Community creation with join/approval workflows
- Event registration, waitlist, and ticketing
- Payments via Razorpay with webhook processing
- Community chat (Supabase Realtime)
- Community media gallery
- Invite tokens for community sharing
- Notifications (in-app + email)
- Admin dashboard for platform management
- Onboarding flow with interest tags

---

## Local Development

### Prerequisites

- Node.js 18.17.0+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application

### 1. Clone and install

```bash
git clone <repo-url>
cd the-kyoty-circle
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Razorpay (optional for local dev)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Resend (optional for local dev)
RESEND_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations

Open your Supabase project → SQL Editor, then run each migration in order:

```
migrations/001_supabase_schema.sql
migrations/002_...
...
migrations/020_missing_indexes.sql
```

> Migrations are plain SQL files. Run them sequentially. Each is idempotent (uses `IF NOT EXISTS`).

### 4. Configure Clerk → Supabase JWT

In your Clerk dashboard → JWT Templates, create a template named **`supabase`** with:

```json
{
  "role": "authenticated"
}
```

In your Supabase dashboard → Authentication → JWT Settings, set the JWKS URL to your Clerk JWKS endpoint:

```
https://<your-clerk-domain>/.well-known/jwks.json
```

### 5. Start the dev server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                  # Next.js pages & API routes
│   ├── api/
│   │   ├── health/       # Health check endpoint
│   │   ├── invite/       # Community invite token handler
│   │   ├── mobile/       # Mobile API endpoints
│   │   ├── notifications/ # Notification inbox API
│   │   ├── payments/     # Razorpay order + webhook
│   │   └── webhooks/     # Clerk user.created webhook
│   ├── community/[slug]/ # Community detail pages
│   ├── event/[id]/       # Event detail pages
│   ├── explore/          # Event discovery
│   └── ...
├── components/           # Shared React components
├── lib/
│   ├── api-response.ts   # Standardized API response helpers
│   ├── auth-server.ts    # Server-side Clerk auth helpers
│   ├── email.ts          # Resend email service
│   ├── repositories/     # Data access layer (one file per table)
│   ├── services/         # Business logic (EventService, CommunityService)
│   └── validations/      # Zod schemas
├── utils/supabase/       # Supabase client factory (browser + server)
└── middleware.ts         # Clerk auth middleware
migrations/               # Ordered SQL migration files (001–020)
kyoty-mobile/             # React Native app (Expo)
docs/                     # Architecture docs
```

---

## Architecture

```
Browser → Clerk Auth → ClerkMiddleware
  → Server Component / API Route
    → auth-server.ts (getCurrentUser via Clerk + Supabase lookup)
    → Service Layer (EventService, CommunityService)
    → Repository Layer (typed DB access)
    → Supabase client (with Clerk JWT)
      → RLS policies validate (auth.jwt() ->> 'sub')
      → PostgreSQL
```

See [docs/ARCHITECTURE_SCALING.md](docs/ARCHITECTURE_SCALING.md) for scalability considerations.

---

## Deployment

### Vercel (recommended)

1. Connect the repo to Vercel
2. Add all environment variables in the Vercel dashboard
3. Deploy — `next.config.mjs` uses `output: "standalone"` mode

### Docker

```bash
# Build
docker build -t kyoty .

# Run (requires .env.production with all secrets)
docker compose up
```

The Docker image uses multi-stage build (Node 18 Alpine). The `/api/health` endpoint is used for container health checks.

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET/PUT | `/api/notifications` | Fetch / mark-read notifications |
| POST | `/api/payments/order` | Create Razorpay order |
| POST | `/api/payments/webhook` | Razorpay payment webhook |
| GET | `/api/invite/[token]` | Process community invite link |
| GET | `/api/mobile/events` | Mobile-optimized event list |
| POST | `/api/webhooks/clerk` | Clerk user.created webhook |

---

## Mobile App

The React Native app lives in `kyoty-mobile/`. It uses Expo and shares the same Supabase backend.

```bash
cd kyoty-mobile
npm install
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY
npx expo start
```
