-- Migration to fix Supabase RLS performance issues
-- This script optimizes RLS policies by preventing re-evaluation of auth.uid() for each row
-- and consolidates multiple permissive policies on the questions table

-- ============================================================================
-- PART 1: Drop existing policies
-- ============================================================================

-- Users policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Role Requests policies
DROP POLICY IF EXISTS "Users can view own role requests" ON role_requests;
DROP POLICY IF EXISTS "Users can create role requests" ON role_requests;
DROP POLICY IF EXISTS "Admins can update role requests" ON role_requests;

-- Questions policies
DROP POLICY IF EXISTS "Authenticated users can create questions" ON questions;
DROP POLICY IF EXISTS "Users can update own questions" ON questions;
DROP POLICY IF EXISTS "MP staff can update any question" ON questions;
DROP POLICY IF EXISTS "Users and MP staff can update questions" ON questions;  -- New consolidated policy
DROP POLICY IF EXISTS "Users can delete own questions" ON questions;

-- Votes policies
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON votes;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- ============================================================================
-- PART 2: Create optimized policies with (SELECT auth.uid())
-- ============================================================================

-- Users policies (optimized)
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING ((SELECT auth.uid()) = id);

-- Role Requests policies (optimized)
CREATE POLICY "Users can view own role requests"
    ON role_requests FOR SELECT
    USING ((SELECT auth.uid()) = user_id OR EXISTS (
        SELECT 1 FROM users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin'
    ));

CREATE POLICY "Users can create role requests"
    ON role_requests FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can update role requests"
    ON role_requests FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin'
    ));

-- Questions policies (optimized and consolidated)
CREATE POLICY "Authenticated users can create questions"
    ON questions FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- CONSOLIDATED: Combined "Users can update own questions" and "MP staff can update any question"
-- This eliminates the multiple permissive policies warning
CREATE POLICY "Users and MP staff can update questions"
    ON questions FOR UPDATE
    USING (
        (SELECT auth.uid()) = user_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = (SELECT auth.uid())
            AND users.role IN ('mp_staff', 'admin')
        )
    );

CREATE POLICY "Users can delete own questions"
    ON questions FOR DELETE
    USING ((SELECT auth.uid()) = user_id);

-- Votes policies (optimized)
CREATE POLICY "Authenticated users can vote"
    ON votes FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own votes"
    ON votes FOR DELETE
    USING ((SELECT auth.uid()) = user_id);

-- Notifications policies (optimized)
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the policies are correctly applied:

-- Check all policies on tables
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Count policies per table
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;
