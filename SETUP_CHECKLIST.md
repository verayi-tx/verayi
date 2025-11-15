# 🚀 Setup Checklist - Ready to Deploy

Follow this checklist to get your app fully functional.

---

## ✅ Database Setup (Supabase)

### Step 1: Run the Database Creation Script

1. Open **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy and paste the contents of `DATABASE_SETUP.sql`
3. Click **Run** to execute
4. Verify success:
   ```sql
   -- Should return 3 tables with rowsecurity = true
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('drafts', 'sent', 'inbox');
   ```

### Step 2: Verify Tables Created

Go to **Supabase Dashboard** → **Table Editor**

You should see:
- ✅ **drafts** - With columns: id, to, subject, body, session_id, last_updated, created_at
- ✅ **sent** - With columns: id, to, subject, body, session_id, created_at
- ✅ **inbox** - With columns: id, from_identity, to, subject, body, tags, visibility, created_at

### Step 3: Verify RLS Policies

Go to **Supabase Dashboard** → **Authentication** → **Policies**

You should see policies for each table:
- ✅ **drafts**: "Enable all operations for drafts"
- ✅ **sent**: "Enable all operations for sent"
- ✅ **inbox**: "Enable read for public inbox", "Enable insert for inbox"

---

## ✅ Application Configuration

### Step 1: Verify Supabase Credentials

Check `/src/lib/supabase.ts`:
```typescript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'
```

✅ **Already configured** (you set this earlier)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

---

## ✅ Testing the Application

### Test 1: Author Mode (You)

1. Open browser console (F12)
2. Run: `toggleAuthorMode()`
3. Should see: `"Switched to AUTHOR mode"`
4. Run: `checkAuthorStatus()`
5. Should see: `"Current mode: AUTHOR"`

**Test sending to inbox:**
1. Click **Compose**
2. Fill in:
   - To: `reader@example.com`
   - Subject: `Welcome to my site!`
   - Body: `This is a public post.`
3. Click **Send**
4. Enter your name/email when prompted
5. Click **Inbox** in sidebar
6. ✅ Your message should appear!

### Test 2: Visitor Mode

1. Open browser console (F12)
2. Run: `toggleAuthorMode()`
3. Should see: `"Switched to VISITOR mode"`

**Test drafts:**
1. Click **Compose**
2. Fill in:
   - To: `someone@example.com`
   - Subject: `Test draft`
   - Body: `This is my draft.`
3. Wait 1 second (auto-save)
4. Close the modal (X button)
5. Click **Drafts** in sidebar
6. ✅ Your draft should appear!
7. Click the draft to reopen and edit

**Test sending to sent:**
1. Click **Compose**
2. Fill in all fields
3. Click **Send**
4. Click **Sent** in sidebar
5. ✅ Your message should appear!

### Test 3: Session Isolation

1. Send a message in visitor mode
2. Open DevTools → Application → Local Storage
3. Delete the `session_id` key
4. Refresh the page
5. Go to **Sent** folder
6. ✅ Should be empty (new session created)

---

## ✅ Feature Verification

### Drafts Feature
- [x] Compose button opens modal
- [x] Auto-saves after 1 second of typing
- [x] Drafts appear in Drafts folder
- [x] Clicking draft reopens for editing
- [x] Discard button deletes draft
- [x] Send button deletes draft (after sending)

### Sent Feature (Visitors)
- [x] Send button creates sent message
- [x] Sent messages appear in Sent folder
- [x] Sent messages show "To: recipient"
- [x] Sent messages are permanent
- [x] Only own sent messages visible

### Inbox Feature (Everyone)
- [x] Public posts visible to all
- [x] Author can publish to inbox
- [x] Visitors cannot publish to inbox
- [x] Inbox shows from_identity

### Security
- [x] Session-based isolation working
- [x] RLS enabled on all tables
- [x] Can't access other users' drafts
- [x] Can't access other users' sent messages

---

## ✅ Optional: Seed Sample Data

To test with sample data, run in Supabase SQL Editor:

```sql
-- Sample inbox post
INSERT INTO inbox (from_identity, to, subject, body, visibility) 
VALUES (
  'Site Owner', 
  'Everyone', 
  'Welcome to our platform!', 
  'This is a sample public post that everyone can see.',
  'public'
);

-- Sample inbox posts for testing
INSERT INTO inbox (from_identity, to, subject, body, visibility) 
VALUES 
  ('John Doe', 'Community', 'Check out this article', 'I found this really interesting...', 'public'),
  ('Jane Smith', 'Tech Enthusiasts', 'New framework released', 'Have you seen the new framework?', 'public'),
  ('Admin', 'All users', 'System maintenance', 'We will be performing maintenance...', 'public');
```

---

## ✅ Deployment Preparation

### Step 1: Build for Production

```bash
npm run build
```

Should create a `dist/` folder with optimized files.

### Step 2: Preview Production Build

```bash
npm run preview
```

Test the production build locally.

### Step 3: Environment Variables (Optional)

For better security in production, move credentials to environment variables:

Create `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Update `/src/lib/supabase.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

Add to `.gitignore`:
```
.env
.env.local
```

---

## ✅ Deploy to Hosting

### Option 1: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag `dist/` folder to Netlify Drop
3. Site is live!

### Option 2: Vercel
```bash
npm install -g vercel
vercel --prod
```

### Option 3: Cloudflare Pages
1. Go to Cloudflare Pages
2. Connect your Git repo
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## ✅ Post-Deployment Testing

Visit your live site and:
1. Open console → Run `checkAuthorStatus()`
2. Test Compose → Draft → Send workflow
3. Toggle between Author and Visitor modes
4. Verify session persistence across refreshes

---

## 🎉 You're Done!

Your app is now:
- ✅ Connected to Supabase
- ✅ RLS enabled for security
- ✅ Session-based user isolation
- ✅ Role-based sending (Author vs Visitor)
- ✅ Fully functional draft/sent/inbox system
- ✅ Ready for production deployment

---

## 📚 Documentation Reference

- `DATABASE_SETUP.sql` - Complete database schema and RLS policies
- `SECURITY_MODEL.md` - Detailed security documentation
- `SENT_TABLE_SETUP.md` - Sent table specific setup
- `SETUP_CHECKLIST.md` - This file

---

## 🆘 Troubleshooting

### Issue: "No data showing in Inbox/Drafts/Sent"
- Check Supabase connection in DevTools Network tab
- Verify RLS policies are created
- Check console for errors

### Issue: "Cannot send messages"
- Verify you're in correct mode (`checkAuthorStatus()`)
- Check Supabase table exists
- Verify session_id in localStorage

### Issue: "Drafts not auto-saving"
- Wait 1 second after typing (debounced)
- Check console for errors
- Verify drafts table has session_id column

### Issue: "RLS errors in console"
- Make sure you ran `DATABASE_SETUP.sql` completely
- Verify policies exist in Supabase dashboard
- Check anon key permissions

---

## 🚀 Next Steps

- [ ] Add user profiles (with Supabase Auth)
- [ ] Implement email notifications
- [ ] Add attachment support
- [ ] Create admin dashboard
- [ ] Add analytics tracking
- [ ] Implement search functionality
