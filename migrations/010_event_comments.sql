-- Event comments / Q&A
CREATE TABLE IF NOT EXISTS event_comments (
    id          SERIAL PRIMARY KEY,
    event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS event_comments_event_id_idx ON event_comments(event_id, created_at DESC);

ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-deleted comments
CREATE POLICY "event_comments_select"
    ON event_comments FOR SELECT
    USING (is_deleted = FALSE);

-- Authenticated users can insert
CREATE POLICY "event_comments_insert"
    ON event_comments FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- Users can soft-delete their own comments; platform admins can delete any
CREATE POLICY "event_comments_update"
    ON event_comments FOR UPDATE
    TO authenticated
    USING (
        user_id = (SELECT id FROM kyoty_users WHERE auth_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM kyoty_users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'kyoty_admin')
        )
    );
