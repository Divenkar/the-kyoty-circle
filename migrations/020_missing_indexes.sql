-- Migration 020: Add missing performance indexes
-- ===================================================
-- These tables were missing indexes on frequently-queried columns.

-- notifications: most queries filter by user + read status, ordered by date
-- Partial index on unread only (the hot path — unread badge count, inbox)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = false;

-- notifications: full inbox query (all notifications for a user)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(user_id, created_at DESC);

-- event_comments: fetching comments per event ordered by date
-- (migration 010 already adds this, but guarded with IF NOT EXISTS to be safe)
CREATE INDEX IF NOT EXISTS event_comments_event_id_idx
    ON event_comments(event_id, created_at DESC);

-- community_invite_tokens: token lookups (validation on every invite click)
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
    ON community_invite_tokens(token);

-- community_invite_tokens: index on expires_at for filtering out expired tokens
-- (cannot use NOW() in index predicates — it is not immutable)
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at
    ON community_invite_tokens(expires_at)
    WHERE expires_at IS NOT NULL;
