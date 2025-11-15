-- Simple RLS fix for localStorage session_id approach
-- Run this in Supabase SQL Editor

-- ============================================
-- INBOX TABLE - Allow inserts from app
-- ============================================

-- Drop all existing inbox policies
DROP POLICY IF EXISTS "Enable read for public inbox" ON inbox;
DROP POLICY IF EXISTS "Enable insert for inbox" ON inbox;
DROP POLICY IF EXISTS "Enable all operations for inbox" ON inbox;
DROP POLICY IF EXISTS "Users can read own inbox" ON inbox;

-- Create new permissive policies
CREATE POLICY "Allow public read"
ON inbox
FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Allow all inserts"
ON inbox
FOR INSERT
WITH CHECK (true);

-- ============================================
-- DRAFTS TABLE - Allow session-based operations
-- ============================================

DROP POLICY IF EXISTS "Enable all operations for drafts" ON drafts;

CREATE POLICY "Allow all drafts operations"
ON drafts
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- SENT TABLE - Allow session-based operations
-- ============================================

DROP POLICY IF EXISTS "Enable all operations for sent" ON sent;

CREATE POLICY "Allow all sent operations"
ON sent
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================

SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('inbox', 'drafts', 'sent')
ORDER BY tablename, policyname;
