-- ============================================================
-- Migration 024: Full-Text Search with tsvector
-- Adds generated tsvector columns and GIN indexes for fast
-- full-text search on communities and events.
-- ============================================================

-- ─── Communities search vector ──────────────────────────────
ALTER TABLE communities
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(category, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_communities_search
    ON communities USING GIN (search_vector);

-- ─── Events search vector ───────────────────────────────────
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(location_text, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_events_search
    ON events USING GIN (search_vector);
