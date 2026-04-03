-- Migration 018: Migrate auth from Supabase Auth to Clerk
-- Clerk user IDs are strings (e.g. user_2abc123), not UUIDs.
-- auth.uid() returns UUID in Supabase — use (auth.jwt() ->> 'sub') instead,
-- which reads the sub claim as TEXT and works with Clerk's string user IDs.

-- ─── Step 1: Dynamically drop every policy referencing auth_id ───────────────
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (qual ILIKE '%auth_id%' OR with_check ILIKE '%auth_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy % on %', r.policyname, r.tablename;
    END LOOP;
END;
$$;

-- ─── Step 2: Drop the foreign key constraint to auth.users ───────────────────
ALTER TABLE kyoty_users
    DROP CONSTRAINT IF EXISTS kyoty_users_auth_id_fkey;

-- ─── Step 3: Change auth_id from UUID to TEXT ────────────────────────────────
ALTER TABLE kyoty_users
    ALTER COLUMN auth_id TYPE TEXT USING auth_id::TEXT;

-- ─── Step 4: Recreate all policies using (auth.jwt() ->> 'sub') ─────────────
-- auth.jwt() ->> 'sub' returns the JWT sub claim as TEXT,
-- which matches Clerk user IDs stored in auth_id.

CREATE POLICY "users_update_own" ON kyoty_users FOR UPDATE
    USING (auth_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "communities_delete_own" ON communities FOR DELETE
    USING (organizer_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "events_delete_own" ON events FOR DELETE
    USING (created_by IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "event_comments_update" ON event_comments FOR UPDATE TO authenticated
    USING (
        user_id = (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub'))
        OR EXISTS (SELECT 1 FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub') AND role IN ('admin', 'kyoty_admin'))
    );

CREATE POLICY "community_ratings_update" ON community_ratings FOR UPDATE TO authenticated
    USING (user_id = (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "saved_events_select" ON saved_events FOR SELECT
    USING (user_id = (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub') LIMIT 1));

CREATE POLICY "saved_events_insert" ON saved_events FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub') LIMIT 1));

CREATE POLICY "saved_events_delete" ON saved_events FOR DELETE
    USING (user_id = (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub') LIMIT 1));

CREATE POLICY "Users can view own payments" ON payments FOR SELECT
    USING (user_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

CREATE POLICY "Admins can view all payments" ON payments FOR SELECT
    USING (EXISTS (SELECT 1 FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub') AND role IN ('admin', 'kyoty_admin')));

CREATE POLICY "User create reports" ON reports FOR INSERT
    WITH CHECK (reporter_id IN (SELECT id FROM kyoty_users WHERE auth_id = (auth.jwt() ->> 'sub')));

-- ─── Step 5: Drop Supabase Auth trigger (replaced by Clerk webhook) ──────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
