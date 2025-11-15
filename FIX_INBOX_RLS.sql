-- Fix inbox RLS policies to allow inserts from the app
-- Run this in Supabase SQL Editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Enable read for public inbox" ON inbox;
DROP POLICY IF EXISTS "Enable insert for inbox" ON inbox;
DROP POLICY IF EXISTS "Enable all operations for inbox" ON inbox;

-- Create simple permissive policies
-- (Since we're using localStorage session_id, not Supabase Auth)

-- Allow anyone to read public inbox posts
CREATE POLICY "Enable read for public inbox"
ON inbox
FOR SELECT
USING (visibility = 'public');

-- Allow anyone to insert (app logic enforces owner-only)
CREATE POLICY "Enable insert for inbox"
ON inbox
FOR INSERT
WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'inbox';
