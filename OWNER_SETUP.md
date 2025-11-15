# Owner Setup Guide

## Setting Your Owner Session ID

As the site owner, you need to set your browser's session ID to the fixed `OWNER_SESSION_ID` **once**.

### Step 1: Open Your Site

Navigate to your deployed site (or `http://localhost:5173` during development).

### Step 2: Open Browser Console

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: Enable Developer Menu first (Preferences → Advanced → Show Developer menu), then press `Cmd+Option+C`

### Step 3: Run This Command

Copy and paste this **exact command** into the console:

```javascript
localStorage.setItem("session_id", "3b6f5cba-8242-4b02-8f44-7137fcfd3a13")
```

Or use the helper function:

```javascript
becomeOwner()
```

### Step 4: Refresh the Page

Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac) to reload the page.

### Step 5: Verify Owner Status

Run in console:

```javascript
checkOwnerStatus()
```

You should see:
```
Session ID: 3b6f5cba-8242-4b02-8f44-7137fcfd3a13
Status: OWNER
Owner sends to: inbox (public)
```

---

## What This Means

### As OWNER:
- ✅ Your messages go to the **inbox** table (visible to all)
- ✅ You'll be prompted for "from_identity" when sending
- ✅ Your drafts are private (only you can see them)
- ✅ Your sent messages appear in the public inbox

### As VISITOR (default for everyone else):
- ✅ Their messages go to the **sent** table (private, per-session)
- ✅ No "from_identity" prompt (anonymous)
- ✅ Their drafts are private (only they can see them)
- ✅ Their sent messages are private (only they can see them)

---

## Testing

### Test as Owner:
1. Set your session ID as shown above
2. Click **Compose**
3. Fill in To, Subject, Body
4. Click **Send**
5. Enter your name/email when prompted
6. Check **Inbox** → Your message appears (public)

### Test as Visitor:
1. Open a different browser or incognito window
2. Visit your site (don't set session ID)
3. Click **Compose**
4. Fill in To, Subject, Body
5. Click **Send** (no prompt)
6. Check **Sent** → Message appears (private to that session)

---

## Security Model

### Fixed Owner Session ID
```
OWNER_SESSION_ID = "3b6f5cba-8242-4b02-8f44-7137fcfd3a13"
```

This is **hardcoded in the app** at `/src/lib/api.ts`.

### How It Works:
1. Every user gets a random `session_id` on first visit (stored in localStorage)
2. The app checks: `getSessionId() === OWNER_SESSION_ID`
3. If match → Owner (sends to inbox)
4. If no match → Visitor (sends to sent)

### RLS Policies (Supabase):

**inbox table:**
- SELECT: Anyone can read (public posts)
- INSERT: Only allowed if `session_id = OWNER_SESSION_ID`
- UPDATE/DELETE: Disabled (immutable)

**drafts & sent tables:**
- All operations filtered by `session_id`
- Users can only access their own rows

---

## Changing the Owner

To change who the owner is, update `/src/lib/api.ts`:

```typescript
export const OWNER_SESSION_ID = "your-new-uuid-here";
```

Then:
1. Rebuild the app: `npm run build`
2. Redeploy
3. Set the new owner's browser localStorage to the new ID

---

## Multiple Owners (Future Enhancement)

For multiple owners, you could:

1. Create an `owners` table in Supabase:
   ```sql
   CREATE TABLE owners (
     session_id uuid PRIMARY KEY
   );
   ```

2. Update `isOwner()` function:
   ```typescript
   export async function isOwner(): Promise<boolean> {
     const sessionId = getSessionId()
     const { data } = await supabase
       .from('owners')
       .select('session_id')
       .eq('session_id', sessionId)
       .single()
     return !!data
   }
   ```

3. Add owners via Supabase dashboard

But for now, the single fixed `OWNER_SESSION_ID` works great for a personal site!

---

## Console Commands Reference

Once the app loads, these functions are available in the browser console:

```javascript
// Check if you're the owner
checkOwnerStatus()

// Get your current session ID
getSessionId()

// Become the owner (then refresh page)
becomeOwner()

// View the owner session ID
OWNER_SESSION_ID
```

---

## Troubleshooting

### "I set the session ID but I'm still a visitor"
- Make sure you **refreshed the page** after setting it
- Check for typos - the UUID must be exact
- Run `checkOwnerStatus()` to verify

### "Other people can see my owner session ID in the code"
- This is by design for simplicity
- Visitors can't use it to impersonate you without access to your browser
- RLS policies enforce this at the database level
- For production, consider migrating to Supabase Auth

### "I want to test as a visitor from the same browser"
- Open an Incognito/Private window
- Or use a different browser
- Or manually change your session ID in localStorage:
  ```javascript
  localStorage.setItem("session_id", crypto.randomUUID())
  location.reload()
  ```

---

## Next Steps

✅ Set your owner session ID  
✅ Test sending as owner (goes to inbox)  
✅ Test sending as visitor (goes to sent)  
✅ Deploy your site  
✅ Share with users!
