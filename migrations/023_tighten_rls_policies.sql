-- ============================================================
-- Migration 023: Tighten RLS Policies
-- Replace overly permissive USING (true) write policies with
-- proper user-scoped or role-scoped checks.
-- ============================================================

-- Helper: reusable expression for "current Clerk user's kyoty_users.id"
-- (auth.jwt() ->> 'sub') returns the Clerk user ID string.
-- We look up the numeric kyoty_users.id from that.

-- ─── community_roles ────────────────────────────────────────
-- Previously: INSERT/UPDATE/DELETE all USING (true)
-- Fix: Only community organizers or platform admins can manage roles.

DROP POLICY IF EXISTS "community_roles_insert" ON community_roles;
DROP POLICY IF EXISTS "community_roles_update" ON community_roles;
DROP POLICY IF EXISTS "community_roles_delete" ON community_roles;

CREATE POLICY "community_roles_insert" ON community_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_roles.community_id
                  )
                  OR u.id IN (
                      SELECT cr.user_id FROM community_roles cr
                      WHERE cr.community_id = community_roles.community_id
                        AND cr.role = 'owner'
                  )
              )
        )
    );

CREATE POLICY "community_roles_update" ON community_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_roles.community_id
                  )
                  OR u.id IN (
                      SELECT cr.user_id FROM community_roles cr
                      WHERE cr.community_id = community_roles.community_id
                        AND cr.role = 'owner'
                  )
              )
        )
    );

CREATE POLICY "community_roles_delete" ON community_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_roles.community_id
                  )
                  OR u.id IN (
                      SELECT cr.user_id FROM community_roles cr
                      WHERE cr.community_id = community_roles.community_id
                        AND cr.role = 'owner'
                  )
              )
        )
    );

-- ─── community_members ──────────────────────────────────────
-- Previously: UPDATE/DELETE only checked IS NOT NULL
-- Fix: Users can update/delete own membership; organizers/admins can manage all.

DROP POLICY IF EXISTS "community_members_update" ON community_members;
DROP POLICY IF EXISTS "community_members_delete" ON community_members;

CREATE POLICY "community_members_update" ON community_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_members.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_members.community_id
                  )
                  OR u.id IN (
                      SELECT cr.user_id FROM community_roles cr
                      WHERE cr.community_id = community_members.community_id
                        AND cr.role IN ('owner', 'admin')
                  )
              )
        )
    );

CREATE POLICY "community_members_delete" ON community_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_members.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_members.community_id
                  )
              )
        )
    );

-- ─── events ─────────────────────────────────────────────────
-- Previously: UPDATE only checked IS NOT NULL
-- Fix: Only event creator, community organizer, or platform admin can update.

DROP POLICY IF EXISTS "events_update" ON events;

CREATE POLICY "events_update" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = events.created_by
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = events.community_id
                  )
              )
        )
    );

-- ─── event_participants ─────────────────────────────────────
-- Previously: UPDATE/DELETE only checked IS NOT NULL
-- Fix: Own participation or admin/organizer.

DROP POLICY IF EXISTS "event_participants_update" ON event_participants;
DROP POLICY IF EXISTS "event_participants_delete" ON event_participants;

CREATE POLICY "event_participants_update" ON event_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = event_participants.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
              )
        )
    );

CREATE POLICY "event_participants_delete" ON event_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = event_participants.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
              )
        )
    );

-- ─── ticket_tiers ───────────────────────────────────────────
-- Previously: INSERT/UPDATE/DELETE only checked IS NOT NULL
-- Fix: Only event creator or admin can manage tiers.

DROP POLICY IF EXISTS "ticket_tiers_insert" ON ticket_tiers;
DROP POLICY IF EXISTS "ticket_tiers_update" ON ticket_tiers;
DROP POLICY IF EXISTS "ticket_tiers_delete" ON ticket_tiers;

CREATE POLICY "ticket_tiers_insert" ON ticket_tiers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            JOIN events e ON e.id = ticket_tiers.event_id
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (u.id = e.created_by OR u.role IN ('admin', 'kyoty_admin'))
        )
    );

CREATE POLICY "ticket_tiers_update" ON ticket_tiers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            JOIN events e ON e.id = ticket_tiers.event_id
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (u.id = e.created_by OR u.role IN ('admin', 'kyoty_admin'))
        )
    );

CREATE POLICY "ticket_tiers_delete" ON ticket_tiers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            JOIN events e ON e.id = ticket_tiers.event_id
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (u.id = e.created_by OR u.role IN ('admin', 'kyoty_admin'))
        )
    );

-- ─── community_messages ─────────────────────────────────────
-- Previously: DELETE USING (true)
-- Fix: Author, community organizer, or admin can delete.

DROP POLICY IF EXISTS "community_messages_delete" ON community_messages;

CREATE POLICY "community_messages_delete" ON community_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_messages.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_messages.community_id
                  )
              )
        )
    );

-- ─── community_media ────────────────────────────────────────
-- Previously: DELETE USING (true)
-- Fix: Uploader, community organizer, or admin can delete.

DROP POLICY IF EXISTS "community_media_delete" ON community_media;

CREATE POLICY "community_media_delete" ON community_media
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_media.uploaded_by
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_media.community_id
                  )
              )
        )
    );

-- ─── community_posts ────────────────────────────────────────
-- Previously: INSERT/UPDATE/DELETE all USING (TRUE)
-- Fix: Authenticated members can insert; author/organizer/admin can update/delete.

DROP POLICY IF EXISTS "community_posts_insert" ON community_posts;
DROP POLICY IF EXISTS "community_posts_update" ON community_posts;
DROP POLICY IF EXISTS "community_posts_delete" ON community_posts;

CREATE POLICY "community_posts_insert" ON community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT cm.user_id FROM community_members cm
                      WHERE cm.community_id = community_posts.community_id
                        AND cm.status = 'approved'
                  )
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_posts.community_id
                  )
              )
        )
    );

CREATE POLICY "community_posts_update" ON community_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_posts.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_posts.community_id
                  )
              )
        )
    );

CREATE POLICY "community_posts_delete" ON community_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = community_posts.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
                  OR u.id IN (
                      SELECT c.organizer_id FROM communities c
                      WHERE c.id = community_posts.community_id
                  )
              )
        )
    );

-- ─── post_reactions ─────────────────────────────────────────
-- Previously: INSERT/DELETE all USING (TRUE)
-- Fix: Authenticated users can insert own; can only delete own.

DROP POLICY IF EXISTS "post_reactions_insert" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete" ON post_reactions;

CREATE POLICY "post_reactions_insert" ON post_reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND u.id = post_reactions.user_id
        )
    );

CREATE POLICY "post_reactions_delete" ON post_reactions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND u.id = post_reactions.user_id
        )
    );

-- ─── post_comments ──────────────────────────────────────────
-- Previously: INSERT/UPDATE/DELETE all USING (TRUE)
-- Fix: Authenticated insert own; author or admin can update/delete.

DROP POLICY IF EXISTS "post_comments_insert" ON post_comments;
DROP POLICY IF EXISTS "post_comments_update" ON post_comments;
DROP POLICY IF EXISTS "post_comments_delete" ON post_comments;

CREATE POLICY "post_comments_insert" ON post_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND u.id = post_comments.user_id
        )
    );

CREATE POLICY "post_comments_update" ON post_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = post_comments.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
              )
        )
    );

CREATE POLICY "post_comments_delete" ON post_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND (
                  u.id = post_comments.user_id
                  OR u.role IN ('admin', 'kyoty_admin')
              )
        )
    );

-- ─── admin_logs ─────────────────────────────────────────────
-- Previously: SELECT USING (true) — anyone could read admin audit logs
-- Fix: Only platform admins can read.

DROP POLICY IF EXISTS "admin_logs_select" ON admin_logs;

CREATE POLICY "admin_logs_select" ON admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM kyoty_users u
            WHERE u.auth_id = (auth.jwt() ->> 'sub')
              AND u.role IN ('admin', 'kyoty_admin')
        )
    );
