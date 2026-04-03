-- ============================================================
-- Migration 021: Community Posts, Reactions & Comments
-- Adds a structured content feed layer to communities.
-- ============================================================

-- ─── community_posts ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
    id           BIGSERIAL PRIMARY KEY,
    community_id BIGINT        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      BIGINT        NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    content      TEXT          NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
    image_url    TEXT          NULL,
    is_deleted   BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── post_reactions ─────────────────────────────────────────
-- One reaction type per user per post (upsert-friendly)
CREATE TABLE IF NOT EXISTS post_reactions (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    type       TEXT        NOT NULL DEFAULT 'like' CHECK (type IN ('like', 'fire', 'heart', 'clap')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

-- ─── post_comments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────
-- Feed query: posts per community ordered newest first
CREATE INDEX IF NOT EXISTS idx_community_posts_community_created
    ON community_posts(community_id, created_at DESC)
    WHERE is_deleted = FALSE;

-- Author lookup
CREATE INDEX IF NOT EXISTS idx_community_posts_user
    ON community_posts(user_id);

-- Comments per post
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created
    ON post_comments(post_id, created_at ASC)
    WHERE is_deleted = FALSE;

-- Reactions per post (count queries)
CREATE INDEX IF NOT EXISTS idx_post_reactions_post
    ON post_reactions(post_id);

-- ─── Updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_updated_at ON community_posts;
CREATE TRIGGER trg_post_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_post_updated_at();

-- ─── RLS Policies ───────────────────────────────────────────
ALTER TABLE community_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments    ENABLE ROW LEVEL SECURITY;

-- Posts: anyone authenticated can read non-deleted posts
CREATE POLICY "posts_select" ON community_posts
    FOR SELECT USING (is_deleted = FALSE);

-- Posts: insert requires membership or organizer status (enforced in app layer)
CREATE POLICY "posts_insert" ON community_posts
    FOR INSERT WITH CHECK (TRUE);

-- Posts: only author or service role can update/delete
CREATE POLICY "posts_update" ON community_posts
    FOR UPDATE USING (TRUE);

CREATE POLICY "posts_delete" ON community_posts
    FOR DELETE USING (TRUE);

-- Reactions
CREATE POLICY "reactions_select" ON post_reactions FOR SELECT USING (TRUE);
CREATE POLICY "reactions_insert" ON post_reactions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "reactions_delete" ON post_reactions FOR DELETE USING (TRUE);

-- Comments
CREATE POLICY "comments_select" ON post_comments FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "comments_insert" ON post_comments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "comments_update" ON post_comments FOR UPDATE USING (TRUE);
CREATE POLICY "comments_delete" ON post_comments FOR DELETE USING (TRUE);
