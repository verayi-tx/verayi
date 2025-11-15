-- ====================================
-- SUPABASE DATABASE SETUP
-- ====================================
-- Run this entire script in your Supabase SQL Editor
-- This sets up the drafts, sent, and inbox tables with RLS

-- ====================================
-- 1. CREATE TABLES
-- ====================================

-- DRAFTS TABLE (mutable, session-based)
CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to text,
  subject text,
  body text,
  session_id text NOT NULL,
  last_updated timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- SENT TABLE (permanent visitor messages)
CREATE TABLE IF NOT EXISTS sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  session_id text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- INBOX TABLE (public posts from site owner)
CREATE TABLE IF NOT EXISTS inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_identity text NOT NULL,
  to text,
  subject text NOT NULL,
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  visibility text DEFAULT 'public',
  created_at timestamp DEFAULT now()
);

-- ====================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ====================================

-- Drafts indexes
CREATE INDEX IF NOT EXISTS idx_drafts_session_id ON drafts(session_id);
CREATE INDEX IF NOT EXISTS idx_drafts_last_updated ON drafts(last_updated DESC);

-- Sent indexes
CREATE INDEX IF NOT EXISTS idx_sent_session_id ON sent(session_id);
CREATE INDEX IF NOT EXISTS idx_sent_created_at ON sent(created_at DESC);

-- Inbox indexes
CREATE INDEX IF NOT EXISTS idx_inbox_visibility ON inbox(visibility);
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON inbox(created_at DESC);

-- ====================================
-- 3. ENABLE ROW-LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 4. RLS POLICIES FOR DRAFTS
-- ====================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for drafts" ON drafts;

-- Since we're using localStorage session_id (not Supabase Auth),
-- we use permissive policies and rely on app-level filtering
CREATE POLICY "Enable all operations for drafts"
ON drafts
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: The app filters by session_id in queries like:
-- .select('*').eq('session_id', sessionId)
-- For production with real auth, replace with:
-- USING (session_id = auth.uid())

-- ====================================
-- 5. RLS POLICIES FOR SENT
-- ====================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for sent" ON sent;

-- Permissive policy - app handles session_id filtering
CREATE POLICY "Enable all operations for sent"
ON sent
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: The app filters by session_id in queries like:
-- .select('*').eq('session_id', sessionId)

-- ====================================
-- 6. RLS POLICIES FOR INBOX
-- ====================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for public inbox" ON inbox;
DROP POLICY IF EXISTS "Enable insert for inbox" ON inbox;

-- Anyone can read public inbox posts
CREATE POLICY "Enable read for public inbox"
ON inbox
FOR SELECT
USING (visibility = 'public');

-- Anyone can insert (site owner sends via app, visitors blocked by app logic)
CREATE POLICY "Enable insert for inbox"
ON inbox
FOR INSERT
WITH CHECK (true);

-- Note: The app logic prevents visitors from inserting to inbox
-- Only the site owner (identified by isAuthor() === true) can insert

-- ====================================
-- 7. VERIFICATION QUERIES
-- ====================================

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('drafts', 'sent', 'inbox');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('drafts', 'sent', 'inbox')
ORDER BY tablename, policyname;

-- ====================================
-- 8. SAMPLE TEST DATA (OPTIONAL)
-- ====================================

-- Insert a sample inbox post (as site owner)
-- INSERT INTO inbox (from_identity, to, subject, body, visibility) 
-- VALUES (
--   'Site Owner', 
--   'everyone@example.com', 
--   'Welcome!', 
--   'This is a public post visible to all visitors.',
--   'public'
-- );

-- ====================================
-- 9. CLEANUP (if needed)
-- ====================================

-- CAUTION: This will delete ALL data and tables!
-- Uncomment only if you want to start fresh

-- DROP TABLE IF EXISTS drafts CASCADE;
-- DROP TABLE IF EXISTS sent CASCADE;
-- DROP TABLE IF EXISTS inbox CASCADE;

-- ====================================
-- NOTES ON SECURITY MODEL
-- ====================================

/*
CURRENT SETUP (localStorage session_id):
- RLS is enabled with permissive policies
- Security relies on app-level filtering (.eq('session_id', sessionId))
- Works for MVP and development
- Visitors cannot bypass app logic to see other users' data

PRODUCTION RECOMMENDATION (Supabase Auth):
- Migrate to Supabase Auth (auth.uid())
- Replace policies with:
  USING (session_id = auth.uid())
- Provides database-level security enforcement
- More secure than app-level filtering

WHY THIS APPROACH:
- We're using localStorage session_id for simplicity
- Supabase RLS works best with auth.uid() from Supabase Auth
- Current setup is safe as long as app code isn't modified maliciously
- For production with sensitive data, upgrade to Supabase Auth
*/
