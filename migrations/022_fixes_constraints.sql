-- ============================================================
-- Migration 022: Fixes & Constraints
-- Adds missing RPC, status constraints, and indexes.
-- ============================================================

-- ─── RPC: Atomic invite token increment ─────────────────────
CREATE OR REPLACE FUNCTION increment_invite_token_use(p_token TEXT)
RETURNS void AS $$
BEGIN
    UPDATE community_invite_tokens
    SET use_count = use_count + 1
    WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Missing index: community_members approved lookup ───────
CREATE INDEX IF NOT EXISTS idx_community_members_approved
    ON community_members(community_id)
    WHERE status = 'approved';

-- ─── Missing index: post_reactions by user ──────────────────
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user
    ON post_reactions(post_id, user_id);

-- ─── Missing index: events by creator + date ────────────────
CREATE INDEX IF NOT EXISTS idx_events_created_by_date
    ON events(created_by, date DESC);
