-- Migration: Add join application fields to community_members
-- Allows applicants to include a reason and social proof when requesting to join

ALTER TABLE community_members
  ADD COLUMN IF NOT EXISTS join_reason text,
  ADD COLUMN IF NOT EXISTS social_proof_link text;
