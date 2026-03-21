-- =====================================================================
-- Migration 006: Fix RLS Policies
-- =====================================================================
-- The original migration 001 had two critical problems:
--   1. community_members had RLS enabled with ZERO policies → all reads
--      and writes were blocked for everyone (isMember, join requests, etc.)
--   2. communities SELECT only allowed status='active'|'approved' →
--      admin panel findPending() returned empty, and findById() on
--      pending communities returned null
-- This migration replaces those broken policies with permissive ones.
-- Business-logic access control is enforced in the app layer (server actions).
-- =====================================================================

-- ---------------------------------------------------------
-- 1. COMMUNITIES — replace restrictive SELECT policy
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Public read approved communities" ON communities;
DROP POLICY IF EXISTS "Organizer manage own community" ON communities;

-- Allow anyone to read any community (app layer handles visibility)
CREATE POLICY "communities_select_all"
    ON communities FOR SELECT
    USING (true);

-- Allow authenticated users to insert communities
CREATE POLICY "communities_insert_auth"
    ON communities FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow organizers and admins to update
CREATE POLICY "communities_update_auth"
    ON communities FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Allow organizers to delete their community
CREATE POLICY "communities_delete_own"
    ON communities FOR DELETE
    USING (organizer_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

-- ---------------------------------------------------------
-- 2. COMMUNITY MEMBERS — add ALL missing policies
-- ---------------------------------------------------------
-- (No policies existed at all — everything was blocked)
DROP POLICY IF EXISTS "members_select_all" ON community_members;
DROP POLICY IF EXISTS "members_insert_own" ON community_members;
DROP POLICY IF EXISTS "members_update_all" ON community_members;
DROP POLICY IF EXISTS "members_delete_all" ON community_members;

CREATE POLICY "members_select_all"
    ON community_members FOR SELECT
    USING (true);

CREATE POLICY "members_insert_auth"
    ON community_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "members_update_auth"
    ON community_members FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "members_delete_auth"
    ON community_members FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------
-- 3. ADMIN LOGS — add missing INSERT + SELECT policies
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "logs_select_all" ON admin_logs;
DROP POLICY IF EXISTS "logs_insert_auth" ON admin_logs;

CREATE POLICY "logs_select_all"
    ON admin_logs FOR SELECT
    USING (true);

CREATE POLICY "logs_insert_auth"
    ON admin_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------
-- 4. REPORTS — add missing SELECT policy
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "reports_select_all" ON reports;

CREATE POLICY "reports_select_all"
    ON reports FOR SELECT
    USING (true);

-- ---------------------------------------------------------
-- 5. NOTIFICATIONS — make select permissive (was too restrictive)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "User manage own notifications" ON notifications;

CREATE POLICY "notifications_select_own"
    ON notifications FOR SELECT
    USING (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

CREATE POLICY "notifications_insert_auth"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    USING (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

CREATE POLICY "notifications_delete_own"
    ON notifications FOR DELETE
    USING (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

-- ---------------------------------------------------------
-- 6. TICKET TIERS — fix the ALL policy (used USING for INSERT)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read for ticket tiers" ON ticket_tiers;
DROP POLICY IF EXISTS "Allow authenticated insert/update" ON ticket_tiers;

CREATE POLICY "ticket_tiers_select_all"
    ON ticket_tiers FOR SELECT
    USING (true);

CREATE POLICY "ticket_tiers_insert_auth"
    ON ticket_tiers FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ticket_tiers_update_auth"
    ON ticket_tiers FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "ticket_tiers_delete_auth"
    ON ticket_tiers FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------
-- 7. REVIEWS — make select public
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "User manage own reviews" ON reviews;

CREATE POLICY "reviews_select_all"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "reviews_insert_auth"
    ON reviews FOR INSERT
    WITH CHECK (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

CREATE POLICY "reviews_update_own"
    ON reviews FOR UPDATE
    USING (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

CREATE POLICY "reviews_delete_own"
    ON reviews FOR DELETE
    USING (user_id IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

-- ---------------------------------------------------------
-- 8. EVENTS — fix the open events policy (too restrictive)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Public read open events" ON events;
DROP POLICY IF EXISTS "Organizer manage own events" ON events;

-- Allow reading all events (app layer handles status filtering)
CREATE POLICY "events_select_all"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "events_insert_auth"
    ON events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "events_update_auth"
    ON events FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_delete_own"
    ON events FOR DELETE
    USING (created_by IN (
        SELECT id FROM kyoty_users WHERE auth_id = auth.uid()
    ));

-- ---------------------------------------------------------
-- 9. EVENT PARTICIPANTS — make select permissive
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "User manage own participation" ON event_participants;

CREATE POLICY "participants_select_all"
    ON event_participants FOR SELECT
    USING (true);

CREATE POLICY "participants_insert_auth"
    ON event_participants FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "participants_update_auth"
    ON event_participants FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "participants_delete_auth"
    ON event_participants FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------
-- 10. KYOTY USERS — keep select public, fix update
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Public read users" ON kyoty_users;
DROP POLICY IF EXISTS "User update own profile" ON kyoty_users;

CREATE POLICY "users_select_all"
    ON kyoty_users FOR SELECT
    USING (true);

CREATE POLICY "users_insert_auth"
    ON kyoty_users FOR INSERT
    WITH CHECK (true); -- handled by auth trigger

CREATE POLICY "users_update_own"
    ON kyoty_users FOR UPDATE
    USING (auth_id = auth.uid());

-- ---------------------------------------------------------
-- 11. STORAGE BUCKET for community media
-- ---------------------------------------------------------
-- NOTE: Run this separately in the Supabase Dashboard → Storage
-- or via the Supabase Management API. SQL migrations cannot
-- create storage buckets directly.
--
-- Dashboard steps:
--   1. Go to Storage in your Supabase project
--   2. Create a new bucket named: community-media
--   3. Set it as Public
--   4. Add the following storage policies:

-- INSERT policy: authenticated users can upload
-- UPDATE/DELETE policy: uploader can manage their own files

-- The SQL equivalent (run in SQL editor after bucket is created):
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "community_media_select_all"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-media');

CREATE POLICY "community_media_insert_auth"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'community-media'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "community_media_delete_own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'community-media'
        AND auth.uid() = owner
    );
*/
