# Supabase Auth → Clerk Migration Plan

> **Guiding principle:** Clerk owns identity; Supabase remains the data store.
> Supabase Row Level Security is preserved via Clerk-issued JWTs that Supabase verifies through a JWKS endpoint.

---

## Critical Constraints

1. `kyoty_users.auth_id` is `UUID REFERENCES auth.users(id)`. Clerk IDs are strings like `user_2abc123`. The FK must be dropped and the column type changed to `TEXT`.
2. All RLS policies calling `auth.uid()` return `null` until Supabase is configured to validate Clerk JWTs via JWKS. **Do Phase 2 before Phase 4.**
3. Any Supabase trigger that auto-creates `kyoty_users` rows must be disabled — `ensureUser()` handles this via a Clerk webhook.
4. No `middleware.ts` exists — it must be created fresh.

---

## Phase 1 — Install Dependencies

```bash
npm install @clerk/nextjs svix
npm uninstall @supabase/ssr
```

> `@supabase/supabase-js` stays — it is still used for all data queries. Only `@supabase/ssr` (auth session handling) is removed.

Add to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YmV0dGVyLW1hcm1vc2V0LTMyLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_VYFc82SZgLkMai9iLBl3F0nh6HsjwmwTsWnjZ5oWBk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=<from Clerk dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Project Settings > API>
```

Keep all existing `NEXT_PUBLIC_SUPABASE_*` variables — still needed for data queries.

---

## Phase 2 — Clerk Dashboard Configuration

### 2.1 Enable Google OAuth in Clerk
Dashboard → User & Authentication → Social Connections → Enable Google.
Use the same Google OAuth credentials currently in Supabase. Disable Google OAuth in Supabase after verifying Clerk's flow works.

### 2.2 Configure Clerk JWT Template for Supabase (CRITICAL)

In Clerk dashboard:
1. Go to JWT Templates
2. Create template named `supabase`
3. Set claims: `{ "role": "authenticated" }` — matches what Supabase RLS expects
4. Copy the JWKS URL: `https://<your-clerk-domain>/.well-known/jwks.json`

In Supabase dashboard:
1. Go to Project Settings → Auth → JWT Settings
2. Add a JWT secret entry pointing to the Clerk JWKS URL

After this, `auth.uid()` in RLS policies returns the Clerk user ID string when the Supabase client is called with a Clerk JWT.

### 2.3 Configure Clerk Webhook
Create webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
Subscribe to: `user.created`

---

## Phase 3 — Database Migration

Create `migrations/018_clerk_auth_migration.sql`:

```sql
-- Drop the FK to auth.users (Supabase-managed table)
ALTER TABLE kyoty_users
    DROP CONSTRAINT IF EXISTS kyoty_users_auth_id_fkey;

-- Change auth_id from UUID to TEXT (Clerk IDs are strings like user_2abc...)
-- The ::TEXT cast preserves existing UUID values as strings
ALTER TABLE kyoty_users
    ALTER COLUMN auth_id TYPE TEXT USING auth_id::TEXT;

-- The UNIQUE constraint on auth_id remains valid — no change needed.

-- Drop Supabase Auth auto-create trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### RLS Policy Audit

**No changes needed — work correctly after type change:**
- Policies using `auth.uid() IS NOT NULL` — all write-authorization policies
- Policies using subquery pattern: `auth_id IN (SELECT id FROM kyoty_users WHERE auth_id = auth.uid())`
- Policy `users_update_own`: `USING (auth_id = auth.uid())` — works because both sides are now TEXT

**Public read policies** (no auth check) — unchanged.

---

## Phase 4 — Core Auth Infrastructure

### 4.1 Create `src/middleware.ts` (NEW FILE)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/login(.*)',
    '/explore(.*)',
    '/community(.*)',
    '/event(.*)',
    '/api/webhooks/(.*)',
]);

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect();
    }
});

export const config = {
    matcher: ['/((?!_next|.*\\..*).*)'],
};
```

### 4.2 Rewrite `src/utils/supabase/server.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Authenticated client — injects Clerk JWT so RLS can identify the user
export async function createClient() {
    const { getToken } = await auth();
    const clerkToken = await getToken({ template: 'supabase' });

    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: clerkToken
                    ? { Authorization: `Bearer ${clerkToken}` }
                    : {},
            },
        }
    );
}

// Service client — bypasses RLS, for webhooks/background jobs (no user session)
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}
```

### 4.3 Rewrite `src/utils/supabase/client.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Pass accessToken from Clerk's useAuth() hook for write operations
export function createClient(accessToken?: string) {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {},
            },
        }
    );
}
```

### 4.4 Rewrite `src/lib/auth-server.ts`

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import type { User, UserRole } from '@/types';

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { userId } = await auth();
        return userId;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const supabase = await createClient();
        const { data } = await supabase
            .from('kyoty_users')
            .select('*')
            .eq('auth_id', userId)
            .single();

        if (data) return data as User;

        // Fallback: create row if webhook hasn't fired yet (race condition safety net)
        const clerkUser = await currentUser();
        return await ensureUser({
            authId: userId,
            email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
            name: clerkUser?.fullName ?? clerkUser?.firstName ?? 'User',
            avatarUrl: clerkUser?.imageUrl,
        });
    } catch {
        return null;
    }
}

export async function ensureUser(profile: {
    authId: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
}): Promise<User> {
    const supabase = await createClient();

    // Check for existing row
    const { data: existing } = await supabase
        .from('kyoty_users')
        .select('*')
        .eq('auth_id', profile.authId)
        .single();

    if (existing) return existing as User;

    // Create new row
    const { data: newUser, error } = await supabase
        .from('kyoty_users')
        .insert({
            auth_id: profile.authId,
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatarUrl,
            role: 'participant',
            default_city_id: 1, // Noida default
            onboarding_completed: false,
        })
        .select()
        .single();

    if (error) throw error;
    return newUser as User;
}

const roleHierarchy: Record<UserRole, number> = {
    participant: 0,
    community_admin: 1,
    admin: 2,
    kyoty_admin: 2,
};

export async function requireRole(requiredRole: UserRole): Promise<User> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Authentication required');
    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
        throw new Error('Insufficient permissions');
    }
    return user;
}
```

### 4.5 Create `src/app/api/webhooks/clerk/route.ts` (NEW FILE)

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { ensureUser } from '@/lib/auth-server';

export async function POST(req: Request) {
    const secret = process.env.CLERK_WEBHOOK_SECRET!;
    const wh = new Webhook(secret);

    const headerPayload = headers();
    const body = await req.text();

    const evt = wh.verify(body, {
        'svix-id': headerPayload.get('svix-id')!,
        'svix-timestamp': headerPayload.get('svix-timestamp')!,
        'svix-signature': headerPayload.get('svix-signature')!,
    }) as { type: string; data: any };

    if (evt.type === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        await ensureUser({
            authId: id,
            email: email_addresses[0]?.email_address ?? '',
            name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
            avatarUrl: image_url,
        });
    }

    return new Response('ok', { status: 200 });
}
```

---

## Phase 5 — Layout and Providers

### 5.1 Rewrite `src/app/providers.tsx`

```typescript
'use client';
import { ClerkProvider } from '@clerk/nextjs';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <ClerkProvider>{children}</ClerkProvider>;
}
```

### 5.2 `src/app/layout.tsx`

No structural changes — `getCurrentUser()` resolves through the rewritten `auth-server.ts`. The `AuthProvider` wrapping `ClerkProvider` is picked up automatically.

### 5.3 Update `src/components/OnboardingGuard.tsx`

Remove `'/auth/callback'` and `'/auth/reset-password'` from the `authFreePaths` list. These routes no longer exist.

### 5.4 Update `src/components/Navbar.tsx`

Replace sign-out call:

```typescript
// Before
import { supabase } from '@/lib/supabase';
await supabase.auth.signOut();

// After
import { useClerk } from '@clerk/nextjs';
const { signOut } = useClerk();
await signOut();
```

Replace any `supabase.auth.onAuthStateChange` / `supabase.auth.getUser()` calls with Clerk's `useUser()` hook:

```typescript
import { useUser } from '@clerk/nextjs';
const { user, isSignedIn } = useUser();
```

---

## Phase 6 — Authentication UI

### 6.1 Rewrite `src/app/login/page.tsx`

Replace Supabase auth calls with Clerk hooks:

| Before (Supabase) | After (Clerk) |
|---|---|
| `supabase.auth.signInWithPassword()` | `useSignIn()` → `signIn.create({ identifier, password })` |
| `supabase.auth.signUp()` | `useSignUp()` → `signUp.create({ emailAddress, password })` |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `signIn.authenticateWithRedirect({ strategy: 'oauth_google', ... })` |
| `supabase.auth.getSession()` on mount | `useUser()` → `isSignedIn` |
| `getCallbackUrl()` / `/auth/callback` redirect logic | Remove entirely |

Or use Clerk's prebuilt `<SignIn />` component inside the existing two-column layout shell for faster implementation.

### 6.2 Delete `src/app/auth/callback/route.ts`

This route is fully replaced by the Clerk webhook (`user.created`). Delete the file.

---

## Phase 7 — Server Actions

**No code changes expected** in any of the 14 server action files. All actions call `getCurrentUser()` or `getCurrentUserId()` from `@/lib/auth-server` — those functions now use Clerk internally. The rest of each action file (Supabase queries using `user.id`) is unchanged.

Files to verify imports are from `@/lib/auth-server` (not direct Supabase auth calls):
- `community.actions.ts`, `community-manage.actions.ts`, `community-admin.actions.ts`
- `admin.actions.ts`, `event.actions.ts`, `organizer.actions.ts`
- `profile.actions.ts`, `saved-events.actions.ts`, `review.actions.ts`
- `community-chat.actions.ts`, `community-roles.actions.ts`, `event-comments.actions.ts`
- `onboarding.actions.ts` — no changes; calls `getCurrentUser()` which still works
- `community-ratings.actions.ts`

---

## Phase 8 — Pages

**No code changes expected.** All pages call `getCurrentUser()` server-side. After rewriting `auth-server.ts`, these resolve correctly.

---

## Phase 9 — API Routes

### `src/app/api/payments/webhook/route.ts`

This Razorpay webhook has no active user session. The current `createClient()` will try to call `auth()` from Clerk and get null, returning an anon client — which may fail RLS for write operations.

**Fix:** Switch this route to use `createServiceClient()` from Phase 4.2:

```typescript
// Before
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();

// After
import { createServiceClient } from '@/utils/supabase/server';
const supabase = createServiceClient();
```

### `src/app/api/invite/[token]/route.ts`

No changes needed — calls `getCurrentUser()` which resolves through rewritten module.

---

## Phase 10 — Cleanup

### Files to Delete
- `src/app/auth/callback/route.ts`
- `src/utils/supabase/middleware.ts`

### Packages to Remove
```bash
npm uninstall @supabase/ssr
```

### Verify `@supabase/supabase-js` is still in `dependencies` — it must remain.

---

## Phase 11 — Testing Checklist

- [ ] New user signs up with email/password → `kyoty_users` row created via webhook → `/onboarding`
- [ ] New user signs up with Google → same row creation path → `/onboarding`
- [ ] Onboarding completes all 5 steps → `onboarding_completed = true` → `/dashboard`
- [ ] Existing user signs in → row found by `auth_id = clerkUserId` → `/dashboard`
- [ ] Unauthenticated user visits `/dashboard` → redirected to `/login`
- [ ] Unauthenticated user visits `/explore` → allowed through
- [ ] User RSVPs for event → server action resolves correctly, Supabase insert succeeds with Clerk JWT
- [ ] Invite token route → unauthenticated redirected to login, authenticated auto-approved
- [ ] Razorpay webhook → processes without user session using service client
- [ ] RLS: user A cannot update user B's profile
- [ ] Sign out → session cleared → redirect to home

---

## Migration Sequence

```
1. Phase 2  → Clerk dashboard: JWT template + Supabase JWKS  (FIRST — unblocks RLS)
2. Phase 3  → DB migration: auth_id UUID→TEXT, drop FK
3. Phase 1  → npm install @clerk/nextjs svix; npm uninstall @supabase/ssr; add env vars
4. Phase 4  → Rewrite core auth layer (middleware, supabase clients, auth-server, webhook route)
5. Phase 5  → Layout + providers + Navbar + OnboardingGuard
6. Phase 6  → Rewrite login page, delete auth/callback route
7. Phase 9  → Fix payments webhook to use service client
8. Phase 10 → Delete old files, clean up packages
9. Phase 11 → Test full lifecycle on staging
```

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| RLS broken if Supabase JWKS not configured before cutover | Critical | Do Phase 2 before Phase 4 code changes |
| Race condition: webhook fires after first page load | Medium | Keep `ensureUser()` fallback in `getCurrentUser()` |
| Existing Supabase auth users cannot log in | High | Export users from Supabase → import to Clerk via Backend API; update `auth_id` values |
| `auth_id` column change breaks existing data | Low | `::TEXT` cast preserves UUID values as strings |
| Payments webhook has no Clerk session | Medium | Use `createServiceClient()` with service role key |

### Existing User Migration (if production data exists)

1. Export users from `auth.users` in Supabase
2. Import into Clerk via Backend API (`/v1/users`) — Clerk assigns new IDs
3. Run a data script to update `kyoty_users.auth_id` to the new Clerk IDs
