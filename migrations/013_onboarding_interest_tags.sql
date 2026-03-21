-- Migration 013: Add onboarding interest tags to kyoty_users
-- Stores the optional interest categories selected during onboarding.

ALTER TABLE kyoty_users
    ADD COLUMN IF NOT EXISTS interest_tags TEXT[] DEFAULT '{}'::text[];
