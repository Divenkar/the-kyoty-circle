-- Migration 017: Community invite tokens
-- Organizers generate a shareable link; clicking it auto-approves the user as a member.

CREATE TABLE IF NOT EXISTS community_invite_tokens (
    id          BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    created_by  BIGINT NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    max_uses    INT NOT NULL DEFAULT 50,
    use_count   INT NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
    ON community_invite_tokens(token);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_community
    ON community_invite_tokens(community_id);
