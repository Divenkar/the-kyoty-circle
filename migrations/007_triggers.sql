-- =====================================================================
-- Migration 007: Postgres Triggers for Data Integrity
-- =====================================================================

-- ---------------------------------------------------------
-- 1. member_count auto-sync trigger
--    Keeps communities.member_count accurate whenever
--    community_members rows are inserted, updated, or deleted.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_sync_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'approved' THEN
            UPDATE communities
            SET member_count = member_count + 1
            WHERE id = NEW.community_id;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            -- Became approved
            UPDATE communities
            SET member_count = member_count + 1
            WHERE id = NEW.community_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            -- Was approved, now rejected/removed
            UPDATE communities
            SET member_count = GREATEST(member_count - 1, 0)
            WHERE id = NEW.community_id;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'approved' THEN
            UPDATE communities
            SET member_count = GREATEST(member_count - 1, 0)
            WHERE id = OLD.community_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_member_count ON community_members;
CREATE TRIGGER trg_sync_member_count
AFTER INSERT OR UPDATE OF status OR DELETE
ON community_members
FOR EACH ROW EXECUTE FUNCTION fn_sync_member_count();


-- ---------------------------------------------------------
-- 2. rating_avg + rating_count auto-sync trigger
--    Recalculates community rating on every review change.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_sync_community_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_community_id BIGINT;
    v_avg          DECIMAL(3,2);
    v_count        INTEGER;
BEGIN
    v_community_id := COALESCE(NEW.community_id, OLD.community_id);

    SELECT
        ROUND(AVG(rating)::numeric, 1),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE community_id = v_community_id;

    UPDATE communities
    SET rating_avg   = COALESCE(v_avg, 0),
        rating_count = v_count
    WHERE id = v_community_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_community_rating ON reviews;
CREATE TRIGGER trg_sync_community_rating
AFTER INSERT OR UPDATE OR DELETE
ON reviews
FOR EACH ROW EXECUTE FUNCTION fn_sync_community_rating();


-- ---------------------------------------------------------
-- 3. Back-fill member_count for existing data
--    Run once to sync counts that accumulated before triggers.
-- ---------------------------------------------------------
UPDATE communities c
SET member_count = (
    SELECT COUNT(*)
    FROM community_members cm
    WHERE cm.community_id = c.id
      AND cm.status = 'approved'
);


-- ---------------------------------------------------------
-- 4. Back-fill rating_avg + rating_count for existing data
-- ---------------------------------------------------------
UPDATE communities c
SET
    rating_avg   = COALESCE((
        SELECT ROUND(AVG(r.rating)::numeric, 1)
        FROM reviews r
        WHERE r.community_id = c.id
    ), 0),
    rating_count = COALESCE((
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.community_id = c.id
    ), 0);
