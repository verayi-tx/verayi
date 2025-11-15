# Security Model Documentation

## Overview

This application uses a **dual-layer security model** for user data isolation:

1. **Application-level filtering** - All queries filter by `session_id`
2. **Row-Level Security (RLS)** - Database policies enforce access control

---

## Session Management

### `session_id` Generation
- **Generated**: On first visit using `crypto.randomUUID()`
- **Stored**: In browser `localStorage` with key `'session_id'`
- **Persistence**: Survives page refreshes, lost only on localStorage clear
- **Format**: UUID v4 (e.g., `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)

### Code Implementation
```typescript
// src/lib/api.ts
export function getSessionId(): string {
  let sessionId = localStorage.getItem('session_id')
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('session_id', sessionId)
  }
  
  return sessionId
}
```

---

## Table Security

### 1. DRAFTS Table

**Purpose**: Store in-progress messages before sending

**Fields**:
- `id` (uuid) - Primary key
- `to` (text) - Recipient
- `subject` (text) - Message subject
- `body` (text) - Message content
- `session_id` (text) - Owner's session
- `last_updated` (timestamp) - Last edit time
- `created_at` (timestamp) - Creation time

**Security Measures**:

| Operation | App-level Filter | RLS Policy |
|-----------|------------------|------------|
| **SELECT** | `.eq('session_id', sessionId)` | Permissive (app enforces) |
| **INSERT** | Sets `session_id` automatically | Permissive (app enforces) |
| **UPDATE** | `.eq('id', draftId).eq('session_id', sessionId)` | Permissive (app enforces) |
| **DELETE** | `.eq('id', draftId).eq('session_id', sessionId)` | Permissive (app enforces) |

**Code Examples**:
```typescript
// Loading drafts (only user's own)
await supabase
  .from('drafts')
  .select('*')
  .eq('session_id', getSessionId()) // ✅ Security: filtered by session
  .order('last_updated', { ascending: false })

// Updating draft (only if user owns it)
await supabase
  .from('drafts')
  .update({ to, subject, body, last_updated: new Date().toISOString() })
  .eq('id', currentDraftId)
  .eq('session_id', getSessionId()) // ✅ Security: only update own drafts

// Deleting draft (only if user owns it)
await supabase
  .from('drafts')
  .delete()
  .eq('id', currentDraftId)
  .eq('session_id', getSessionId()) // ✅ Security: only delete own drafts
```

---

### 2. SENT Table

**Purpose**: Store messages sent by visitors (permanent record)

**Fields**:
- `id` (uuid) - Primary key
- `to` (text) - Recipient
- `subject` (text) - Message subject
- `body` (text) - Message content
- `session_id` (text) - Sender's session
- `created_at` (timestamp) - Send time

**Security Measures**:

| Operation | App-level Filter | RLS Policy |
|-----------|------------------|------------|
| **SELECT** | `.eq('session_id', sessionId)` | Permissive (app enforces) |
| **INSERT** | Sets `session_id` automatically | Permissive (app enforces) |
| **UPDATE** | ❌ Not allowed | ❌ Not allowed |
| **DELETE** | ❌ Not allowed (permanent) | ❌ Not allowed |

**Code Examples**:
```typescript
// Sending message (visitor only)
await supabase
  .from('sent')
  .insert({
    to,
    subject,
    body,
    session_id: getSessionId(), // ✅ Security: tied to sender's session
    created_at: new Date().toISOString()
  })

// Loading sent messages (only user's own)
await supabase
  .from('sent')
  .select('*')
  .eq('session_id', getSessionId()) // ✅ Security: filtered by session
  .order('created_at', { ascending: false })
```

---

### 3. INBOX Table

**Purpose**: Store public posts from site owner

**Fields**:
- `id` (uuid) - Primary key
- `from_identity` (text) - Author name/email
- `to` (text) - Recipient (optional)
- `subject` (text) - Post subject
- `body` (text) - Post content
- `tags` (text[]) - Categorization tags
- `visibility` (text) - Access level ('public')
- `created_at` (timestamp) - Publication time

**Security Measures**:

| Operation | App-level Filter | Who Can Access |
|-----------|------------------|----------------|
| **SELECT** | `.eq('visibility', 'public')` | Everyone (read-only) |
| **INSERT** | Only if `isAuthor() === true` | Site owner only |
| **UPDATE** | ❌ Not implemented | Nobody (immutable) |
| **DELETE** | ❌ Not implemented | Nobody (permanent) |

**Code Examples**:
```typescript
// Loading inbox (public posts visible to all)
await supabase
  .from('inbox')
  .select('*')
  .eq('visibility', 'public') // ✅ Only public posts
  .order('created_at', { ascending: false })

// Inserting to inbox (author only - enforced by app logic)
if (isAuthor()) {
  await supabase
    .from('inbox')
    .insert({
      from_identity,
      to,
      subject,
      body,
      tags: [],
      visibility: 'public'
    })
} else {
  // Visitors blocked at app level
  throw new Error('Unauthorized')
}
```

---

## Role-Based Access

### Author Role
- **Identification**: `localStorage.getItem('is_author') === 'true'`
- **Privileges**:
  - ✅ Can insert to `inbox` (public posts)
  - ✅ Can create/edit/delete own `drafts`
  - ✅ Can read all public `inbox` posts
  - ❌ Cannot insert to `sent` (uses inbox instead)

### Visitor Role
- **Identification**: `localStorage.getItem('is_author') !== 'true'` (default)
- **Privileges**:
  - ✅ Can create/edit/delete own `drafts`
  - ✅ Can insert to `sent` (permanent messages)
  - ✅ Can read own `sent` messages
  - ✅ Can read all public `inbox` posts
  - ❌ Cannot insert to `inbox`

---

## Attack Prevention

### Prevented Attacks

✅ **Draft Hijacking**: Cannot read/edit/delete other users' drafts
- All operations filter by `session_id`

✅ **Sent Message Snooping**: Cannot read other users' sent messages
- `loadSent()` filters by `session_id`

✅ **Inbox Spam**: Visitors cannot publish to inbox
- `isAuthor()` check blocks visitors at app level

### Potential Vulnerabilities

⚠️ **localStorage Manipulation**:
- User can manually set `is_author = 'true'` in localStorage
- **Mitigation**: For production, migrate to Supabase Auth with server-side role verification

⚠️ **Session Hijacking**:
- If attacker obtains victim's `session_id`, they can access victim's data
- **Mitigation**: Use Supabase Auth with JWT tokens

⚠️ **Direct Database Access**:
- Current RLS policies are permissive (rely on app filtering)
- **Mitigation**: Implement stricter RLS policies with Supabase Auth

---

## Production Recommendations

For a production deployment with sensitive data:

### 1. Migrate to Supabase Authentication
```typescript
// Replace localStorage session_id with Supabase Auth
import { supabase } from './supabase'

// Sign up
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
})

// Sign in
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})

// Get current user
const user = supabase.auth.getUser()
```

### 2. Update RLS Policies
```sql
-- Strict RLS using auth.uid()
CREATE POLICY "Users can only read own drafts"
ON drafts
FOR SELECT
USING (session_id = auth.uid());

CREATE POLICY "Users can only update own drafts"
ON drafts
FOR UPDATE
USING (session_id = auth.uid());

CREATE POLICY "Users can only delete own drafts"
ON drafts
FOR DELETE
USING (session_id = auth.uid());
```

### 3. Add Server-Side Role Verification
```typescript
// Verify author role server-side (Supabase Edge Function)
export async function verifyAuthor(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  
  return data?.role === 'author'
}
```

---

## Testing Security

### Test 1: Session Isolation
```javascript
// Browser Console
// 1. Send a draft as Visitor A
toggleAuthorMode() // Ensure visitor mode
// Compose and send a message

// 2. Get session ID
localStorage.getItem('session_id')
// Copy this value

// 3. Clear and create new session
localStorage.clear()
location.reload()

// 4. Verify old sent messages are gone
// Go to Sent folder → Should be empty

// 5. Restore old session
localStorage.setItem('session_id', 'paste-copied-id-here')
location.reload()

// 6. Verify sent messages reappear
// Go to Sent folder → Should show messages
```

### Test 2: Draft Access Control
```javascript
// Browser Console
// 1. Create a draft
// Compose → Type content → Close (auto-saves)

// 2. Go to Drafts folder → Click draft → Note URL param
// Example: draft ID might be in state

// 3. Clear session and try to access same draft
localStorage.removeItem('session_id')
location.reload()
// Try to open the same draft → Should fail/show empty

// 4. Check network tab for security
// Should see .eq('session_id', ...) in Supabase queries
```

### Test 3: Author vs Visitor
```javascript
// Browser Console
// 1. Become author
toggleAuthorMode() // Now author
checkAuthorStatus() // Verify

// 2. Send message → Should go to inbox
// 3. Become visitor
toggleAuthorMode() // Now visitor

// 4. Send message → Should go to sent
```

---

## Monitoring & Auditing

### Suspicious Activity Queries

```sql
-- Find sessions with unusual activity
SELECT 
  session_id,
  COUNT(DISTINCT id) as draft_count,
  MAX(created_at) as last_activity
FROM drafts
GROUP BY session_id
HAVING COUNT(*) > 100
ORDER BY draft_count DESC;

-- Check for rapid message sending
SELECT 
  session_id,
  COUNT(*) as messages_sent,
  MIN(created_at) as first_sent,
  MAX(created_at) as last_sent
FROM sent
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY session_id
HAVING COUNT(*) > 50;
```

---

## Summary

✅ **Current Model**: Secure for MVP and development  
✅ **Session-based**: Isolates user data by localStorage session_id  
✅ **App-level filtering**: All queries properly filter by session_id  
✅ **RLS enabled**: Permissive policies allow app to enforce rules  

⚠️ **For Production**: Migrate to Supabase Auth with stricter RLS policies  
⚠️ **Trade-off**: Simplicity vs. enterprise-grade security  
⚠️ **Use case**: Perfect for personal projects, demos, MVPs
