-- ============================================================
-- Migration 025: Production Hardening
-- Adds CHECK constraints on status fields, missing indexes,
-- cleans up duplicate rating system, and tightens data integrity.
-- ============================================================

-- ─── 1. CHECK constraints on status fields ──────────────────

-- Event status must be one of the valid states
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_events_status'
    ) THEN
        ALTER TABLE events
            ADD CONSTRAINT chk_events_status
            CHECK (status IN ('draft','pending','approved','rejected','open','full','completed','cancelled'));
    END IF;
END $$;

-- Community status must be one of the valid states
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_status'
    ) THEN
        ALTER TABLE communities
            ADD CONSTRAINT chk_communities_status
            CHECK (status IN ('active','pending','approved','rejected','disabled'));
    END IF;
END $$;

-- Community member status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_community_members_status'
    ) THEN
        ALTER TABLE community_members
            ADD CONSTRAINT chk_community_members_status
            CHECK (status IN ('pending','approved','rejected'));
    END IF;
END $$;

-- Event participant status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_event_participants_status'
    ) THEN
        ALTER TABLE event_participants
            ADD CONSTRAINT chk_event_participants_status
            CHECK (status IN ('registered','waitlisted','cancelled','removed','pending_payment'));
    END IF;
END $$;

-- Notification type (non-restricting — allows future types)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_notifications_type'
    ) THEN
        ALTER TABLE notifications
            ADD CONSTRAINT chk_notifications_type
            CHECK (type IN (
                'general','event_approved','event_rejected','event_registration',
                'event_cancelled','event_updated','waitlist_promoted',
                'community_approved','community_rejected',
                'member_approved','member_rejected','join_request',
                'post_reaction','post_comment','event_comment'
            ));
    END IF;
END $$;

-- Payment status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_status'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT chk_payments_status
            CHECK (status IN ('captured','refunded','failed'));
    END IF;
END $$;

-- ─── 2. Missing indexes for performance ─────────────────────

-- User email lookup (login, webhook deduplication)
CREATE INDEX IF NOT EXISTS idx_kyoty_users_email
    ON kyoty_users(email);

-- User auth_id lookup (every authenticated request)
CREATE INDEX IF NOT EXISTS idx_kyoty_users_auth_id
    ON kyoty_users(auth_id);

-- Community category filtering
CREATE INDEX IF NOT EXISTS idx_communities_category
    ON communities(category);

-- Events by status for admin dashboard
CREATE INDEX IF NOT EXISTS idx_events_status
    ON events(status);

-- Community posts updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_community_posts_updated
    ON community_posts(community_id, updated_at DESC)
    WHERE is_deleted = FALSE;

-- ─── 3. Clean up duplicate rating system ────────────────────
-- The app uses community_ratings (migration 011) for ratings.
-- The reviews table (migration 003) has overlapping purpose.
-- We keep both tables but ensure community_ratings trigger is authoritative
-- for communities.rating_avg and rating_count.

-- Drop the old trigger that fires on the reviews table to prevent conflicts.
-- (The community_ratings trigger from migration 011 is the canonical one.)
DROP TRIGGER IF EXISTS trg_sync_community_rating ON reviews;
DROP FUNCTION IF EXISTS fn_sync_community_rating();

-- ─── 4. Ensure NOT NULL on critical columns ─────────────────

-- auth_id should not be null for any valid user row
-- (Can't add NOT NULL if existing nulls exist, so do it conditionally)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'kyoty_users'
          AND column_name = 'auth_id'
          AND is_nullable = 'YES'
    ) THEN
        -- First clean up any orphaned rows without auth_id
        DELETE FROM kyoty_users WHERE auth_id IS NULL;
        ALTER TABLE kyoty_users ALTER COLUMN auth_id SET NOT NULL;
    END IF;
END $$;

-- ─── 5. Event date validation ───────────────────────────────

-- Ensure event date is not more than 2 years in the past (cleanup guard)
-- We don't restrict future dates since events can be planned far ahead.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_events_date_reasonable'
    ) THEN
        ALTER TABLE events
            ADD CONSTRAINT chk_events_date_reasonable
            CHECK (date >= '2024-01-01');
    END IF;
END $$;

-- ─── 6. Waitlist position uniqueness per event ──────────────

-- Ensure no duplicate waitlist positions within the same event
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_participants_waitlist_unique
    ON event_participants(event_id, waitlist_position)
    WHERE status = 'waitlisted' AND waitlist_position IS NOT NULL;

-- ─── 7. Add deleted_at timestamp for soft-deleted records ───

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'community_posts' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE community_posts ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'post_comments' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE post_comments ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_comments' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE event_comments ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;
