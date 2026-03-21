-- ─── Saved Events (bookmarks) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    event_id    BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, event_id)
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_saved_events_user ON saved_events(user_id);

-- RLS
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own saved events
CREATE POLICY "saved_events_select" ON saved_events
    FOR SELECT USING (user_id = (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()::text LIMIT 1
    ));

CREATE POLICY "saved_events_insert" ON saved_events
    FOR INSERT WITH CHECK (user_id = (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()::text LIMIT 1
    ));

CREATE POLICY "saved_events_delete" ON saved_events
    FOR DELETE USING (user_id = (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()::text LIMIT 1
    ));
