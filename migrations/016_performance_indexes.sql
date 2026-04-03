-- Migration 016: Performance indexes
-- These cover the most common query patterns observed in the repositories.
-- All use IF NOT EXISTS so running this twice is safe.

-- ── events ─────────────────────────────────────────────────────────────────

-- Explore page: filter by city + status, order by date
CREATE INDEX IF NOT EXISTS idx_events_city_status_date
    ON events(city_id, status, date DESC);

-- Dashboard: events created by a user
CREATE INDEX IF NOT EXISTS idx_events_created_by
    ON events(created_by);

-- Community event listings
CREATE INDEX IF NOT EXISTS idx_events_community_id_date
    ON events(community_id, date DESC);

-- ── communities ─────────────────────────────────────────────────────────────

-- Communities page: filter by city + status
CREATE INDEX IF NOT EXISTS idx_communities_city_status
    ON communities(city_id, status);

-- Creator lookup (dashboard "communities I manage")
CREATE INDEX IF NOT EXISTS idx_communities_organizer_id
    ON communities(organizer_id);

-- Slug lookup (community detail page)
-- NOTE: slug already has UNIQUE constraint which creates an index; listed here
-- for documentation only.
-- CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);

-- ── community_members ───────────────────────────────────────────────────────

-- "Is user a member of this community?" — called on every event detail page
CREATE INDEX IF NOT EXISTS idx_community_members_community_user
    ON community_members(community_id, user_id, status);

-- Dashboard: all communities a user belongs to
CREATE INDEX IF NOT EXISTS idx_community_members_user_status
    ON community_members(user_id, status);

-- Pending approvals list (admin/community admin panel)
CREATE INDEX IF NOT EXISTS idx_community_members_status
    ON community_members(status) WHERE status = 'pending';

-- ── event_participants ──────────────────────────────────────────────────────

-- Upcoming RSVPs for dashboard
CREATE INDEX IF NOT EXISTS idx_event_participants_user_status
    ON event_participants(user_id, status);

-- Participant list for an event (event detail page)
CREATE INDEX IF NOT EXISTS idx_event_participants_event_status
    ON event_participants(event_id, status);

-- ── kyoty_users ─────────────────────────────────────────────────────────────

-- Auth lookup (called on every request in auth-server.ts)
-- NOTE: auth_id already has UNIQUE constraint; listed for documentation.
-- CREATE INDEX IF NOT EXISTS idx_kyoty_users_auth_id ON kyoty_users(auth_id);

-- Admin user management page: filter by role
CREATE INDEX IF NOT EXISTS idx_kyoty_users_role
    ON kyoty_users(role);

-- ── saved_events ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_saved_events_user_id
    ON saved_events(user_id);

-- ── notifications ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON notifications(user_id, is_read);
