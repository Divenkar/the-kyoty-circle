-- Community ratings & reviews
CREATE TABLE IF NOT EXISTS community_ratings (
    id              SERIAL PRIMARY KEY,
    community_id    INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES kyoty_users(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review          TEXT CHECK (char_length(review) <= 300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_ratings_community_id_idx ON community_ratings(community_id);

ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_ratings_select"
    ON community_ratings FOR SELECT USING (TRUE);

CREATE POLICY "community_ratings_insert"
    ON community_ratings FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "community_ratings_update"
    ON community_ratings FOR UPDATE TO authenticated
    USING (user_id = (SELECT id FROM kyoty_users WHERE auth_id = auth.uid()));

-- Trigger to keep communities.rating_avg and rating_count up to date
CREATE OR REPLACE FUNCTION update_community_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE communities
    SET
        rating_avg   = (SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM community_ratings WHERE community_id = COALESCE(NEW.community_id, OLD.community_id)),
        rating_count = (SELECT COUNT(*) FROM community_ratings WHERE community_id = COALESCE(NEW.community_id, OLD.community_id))
    WHERE id = COALESCE(NEW.community_id, OLD.community_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_community_rating ON community_ratings;
CREATE TRIGGER trg_update_community_rating
    AFTER INSERT OR UPDATE OR DELETE ON community_ratings
    FOR EACH ROW EXECUTE FUNCTION update_community_rating();
