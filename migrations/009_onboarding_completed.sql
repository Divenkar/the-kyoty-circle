-- =====================================================================
-- Migration 009: Add onboarding_completed flag to kyoty_users
-- =====================================================================
-- The OnboardingGuard was checking social_proof_link to determine if
-- a user had completed onboarding. Since step 2 (social proof) is
-- optional/skippable, users who skipped it got redirected back to
-- /onboarding on every navigation. This adds a proper flag that is
-- set explicitly when the user finishes the onboarding flow.
-- =====================================================================

ALTER TABLE kyoty_users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark existing users with a social_proof_link as already completed
UPDATE kyoty_users
SET onboarding_completed = TRUE
WHERE social_proof_link IS NOT NULL;
