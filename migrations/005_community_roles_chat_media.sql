-- =====================================================================
-- Migration 005: Community Roles, Chat, Media
-- =====================================================================

-- ---------------------------------------------------------
-- 1. community_roles  (tier-2 permission model)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_roles (
    id           BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id)   ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES kyoty_users(id)   ON DELETE CASCADE,
    role         TEXT   NOT NULL CHECK (role IN ('owner', 'admin', 'moderator')),
    assigned_by  BIGINT          REFERENCES kyoty_users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (community_id, user_id)
);

-- ---------------------------------------------------------
-- 2. community_messages  (chat – Realtime enabled below)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_messages (
    id           BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id)   ON DELETE CASCADE,
    user_id      BIGINT NOT NULL REFERENCES kyoty_users(id),
    content      TEXT   NOT NULL,
    type         TEXT   DEFAULT 'text'
                        CHECK (type IN ('text', 'image', 'link', 'system')),
    reply_to_id  BIGINT REFERENCES community_messages(id),
    is_deleted   BOOLEAN    DEFAULT FALSE,
    edited_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_community
    ON community_messages (community_id, created_at DESC);

-- ---------------------------------------------------------
-- 3. community_message_reactions
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_message_reactions (
    id         BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES kyoty_users(id)         ON DELETE CASCADE,
    emoji      TEXT   NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (message_id, user_id, emoji)
);

-- ---------------------------------------------------------
-- 4. community_media  (photo gallery)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_media (
    id           BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    uploaded_by  BIGINT NOT NULL REFERENCES kyoty_users(id),
    url          TEXT   NOT NULL,
    caption      TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. Extend communities table
-- ---------------------------------------------------------
ALTER TABLE communities
    ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------
-- 6. Enable RLS
-- ---------------------------------------------------------
ALTER TABLE community_roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_media             ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 7. RLS Policies  (permissive – business logic in app layer)
-- ---------------------------------------------------------

-- community_roles
CREATE POLICY "roles_select_all"   ON community_roles FOR SELECT USING (true);
CREATE POLICY "roles_insert_all"   ON community_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "roles_update_all"   ON community_roles FOR UPDATE USING (true);
CREATE POLICY "roles_delete_all"   ON community_roles FOR DELETE USING (true);

-- community_messages
CREATE POLICY "msgs_select_all"    ON community_messages FOR SELECT USING (true);
CREATE POLICY "msgs_insert_auth"   ON community_messages FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "msgs_update_auth"   ON community_messages FOR UPDATE
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "msgs_delete_all"    ON community_messages FOR DELETE USING (true);

-- community_message_reactions
CREATE POLICY "rxn_select_all"     ON community_message_reactions FOR SELECT USING (true);
CREATE POLICY "rxn_insert_auth"    ON community_message_reactions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rxn_delete_auth"    ON community_message_reactions FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- community_media
CREATE POLICY "media_select_all"   ON community_media FOR SELECT USING (true);
CREATE POLICY "media_insert_auth"  ON community_media FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "media_delete_all"   ON community_media FOR DELETE USING (true);

-- ---------------------------------------------------------
-- 8. Enable Supabase Realtime on chat tables
-- ---------------------------------------------------------
-- Run this in the Supabase dashboard SQL editor if not using migrations:
-- ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE community_message_reactions;

DO $$
BEGIN
    -- Only add if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'community_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'community_message_reactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE community_message_reactions;
    END IF;
END $$;
