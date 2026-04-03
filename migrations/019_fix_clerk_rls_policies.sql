-- Migration 019: Fix remaining auth.uid() calls broken by Clerk migration
-- =====================================================================
-- Migration 018 replaced policies that contained "auth_id" in their text,
-- but 20 policies using `auth.uid() IS NOT NULL` were not touched.
-- With Clerk JWTs, auth.uid() always returns NULL (Clerk IDs are strings,
-- not UUIDs), so these policies block ALL authenticated writes in production.
--
-- Fix: Replace `auth.uid() IS NOT NULL`
--   → `(auth.jwt() ->> 'sub') IS NOT NULL`
-- =====================================================================

-- ─── community_messages ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "msgs_insert_auth" ON community_messages;
DROP POLICY IF EXISTS "msgs_update_auth" ON community_messages;

CREATE POLICY "msgs_insert_auth" ON community_messages FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "msgs_update_auth" ON community_messages FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── community_message_reactions ─────────────────────────────────────────────
DROP POLICY IF EXISTS "rxn_insert_auth" ON community_message_reactions;
DROP POLICY IF EXISTS "rxn_delete_auth" ON community_message_reactions;

CREATE POLICY "rxn_insert_auth" ON community_message_reactions FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "rxn_delete_auth" ON community_message_reactions FOR DELETE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── community_media ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "media_insert_auth" ON community_media;

CREATE POLICY "media_insert_auth" ON community_media FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── communities ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "communities_insert_auth" ON communities;
DROP POLICY IF EXISTS "communities_update_auth" ON communities;

CREATE POLICY "communities_insert_auth" ON communities FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "communities_update_auth" ON communities FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── community_members ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_insert_auth" ON community_members;
DROP POLICY IF EXISTS "members_update_auth" ON community_members;
DROP POLICY IF EXISTS "members_delete_auth" ON community_members;

CREATE POLICY "members_insert_auth" ON community_members FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "members_update_auth" ON community_members FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "members_delete_auth" ON community_members FOR DELETE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── admin_logs ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "logs_insert_auth" ON admin_logs;

CREATE POLICY "logs_insert_auth" ON admin_logs FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── notifications ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_insert_auth" ON notifications;

CREATE POLICY "notifications_insert_auth" ON notifications FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── ticket_tiers ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ticket_tiers_insert_auth" ON ticket_tiers;
DROP POLICY IF EXISTS "ticket_tiers_update_auth" ON ticket_tiers;
DROP POLICY IF EXISTS "ticket_tiers_delete_auth" ON ticket_tiers;

CREATE POLICY "ticket_tiers_insert_auth" ON ticket_tiers FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "ticket_tiers_update_auth" ON ticket_tiers FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "ticket_tiers_delete_auth" ON ticket_tiers FOR DELETE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── events ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_insert_auth" ON events;
DROP POLICY IF EXISTS "events_update_auth" ON events;

CREATE POLICY "events_insert_auth" ON events FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "events_update_auth" ON events FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

-- ─── event_participants ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "participants_insert_auth" ON event_participants;
DROP POLICY IF EXISTS "participants_update_auth" ON event_participants;
DROP POLICY IF EXISTS "participants_delete_auth" ON event_participants;

CREATE POLICY "participants_insert_auth" ON event_participants FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "participants_update_auth" ON event_participants FOR UPDATE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);

CREATE POLICY "participants_delete_auth" ON event_participants FOR DELETE
    USING ((auth.jwt() ->> 'sub') IS NOT NULL);
