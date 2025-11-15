# Sent Table Setup Guide

## 📋 Database Schema

### Create the `sent` table

Run this in your Supabase SQL Editor:

```sql
CREATE TABLE sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  session_id text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Create index for faster queries by session_id
CREATE INDEX idx_sent_session_id ON sent(session_id);
CREATE INDEX idx_sent_created_at ON sent(created_at DESC);
```

---

## 🔐 Row-Level Security (RLS)

Enable RLS and create policies so visitors can only see their own sent messages:

```sql
-- Enable RLS on the sent table
ALTER TABLE sent ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own sent messages
CREATE POLICY "Users can read own sent messages"
ON sent
FOR SELECT
USING (session_id = current_setting('request.headers')::json->>'x-session-id');

-- Policy: Users can only insert with their own session_id
CREATE POLICY "Users can insert own sent messages"
ON sent
FOR INSERT
WITH CHECK (session_id = current_setting('request.headers')::json->>'x-session-id');

-- Alternative simpler policy (if not using headers):
-- This allows anyone to insert, but query filtering is done by session_id in the app
DROP POLICY IF EXISTS "Users can read own sent messages" ON sent;
DROP POLICY IF EXISTS "Users can insert own sent messages" ON sent;

CREATE POLICY "Enable read for users based on session_id"
ON sent
FOR SELECT
USING (true);  -- App-level filtering via .eq('session_id', sessionId)

CREATE POLICY "Enable insert for all users"
ON sent
FOR INSERT
WITH CHECK (true);  -- App validates session_id before insert
```

**Note:** The simpler policies rely on app-level filtering. For stronger security, use the header-based policies.

---

## ✅ Verification Queries

### Check if RLS is enabled:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'sent';
```

### View current policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'sent';
```

### Test query (replace with your session_id):
```sql
SELECT * FROM sent WHERE session_id = 'your-session-id-here';
```

---

## 🎯 How It Works

### For VISITORS:
1. Click **Send** in Compose modal
2. Message inserted into `sent` table with their `session_id`
3. Draft deleted from `drafts` table
4. Message appears in **Sent** mailbox view
5. Only visible to user with matching `session_id`

### For AUTHOR (you):
1. Click **Send** in Compose modal
2. Prompted for "from_identity"
3. Message inserted into `inbox` table (public, visible to all)
4. Draft deleted from `drafts` table
5. Message appears in **Inbox** view

---

## 🧪 Testing

1. **Toggle to visitor mode in console:**
   ```javascript
   toggleAuthorMode()  // Switch to VISITOR
   ```

2. **Send a test message:**
   - Click Compose
   - Fill: To = "test@example.com", Subject = "Test", Body = "Hello"
   - Click Send
   - Should appear in Sent folder

3. **Verify persistence:**
   - Refresh page
   - Click "Sent" in sidebar
   - Your message should still be there

4. **Test RLS:**
   - Open browser DevTools → Application → Local Storage
   - Delete `session_id`
   - Refresh page
   - Go to Sent → Should be empty (new session_id created)

---

## 🗑️ Cleanup (Optional)

If you want to delete old sent messages after X days:

```sql
-- Delete sent messages older than 30 days
DELETE FROM sent 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Or create a scheduled function (requires Supabase Pro)
-- Add this as a Supabase Edge Function or pg_cron job
```

---

## 📊 Monitoring

View all sent messages (admin only via Supabase dashboard):

```sql
SELECT 
  id,
  to,
  subject,
  LEFT(body, 50) as body_preview,
  session_id,
  created_at
FROM sent
ORDER BY created_at DESC
LIMIT 100;
```

Count messages per session:

```sql
SELECT 
  session_id,
  COUNT(*) as message_count,
  MAX(created_at) as last_sent
FROM sent
GROUP BY session_id
ORDER BY message_count DESC;
```
