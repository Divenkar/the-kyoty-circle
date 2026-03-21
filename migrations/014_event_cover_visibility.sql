-- Migration 014: Add cover_image_url and visibility to events table
-- Events should have their own visual identity and access control,
-- consistent with how communities work.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';

COMMENT ON COLUMN events.cover_image_url IS 'Optional cover image for the event. Falls back to community cover if null.';
COMMENT ON COLUMN events.visibility IS 'public = anyone can see it; members_only = only community members can see it.';
