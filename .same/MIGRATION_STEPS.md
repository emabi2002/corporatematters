# 🚀 Database Migration Steps - Run in This Order!

## ⚠️ Important: Run These in Order

If you're getting errors about policies already existing, follow these steps **exactly in this order**.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com
2. Open your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

---

### Step 2: Create All Tables (First Time Only)

**If tables don't exist yet, run this:**

Copy the **ENTIRE contents** of: `.same/database-schema-enhanced.sql`

- Paste into SQL Editor
- Click **"Run"**
- Wait for completion (may take 30-60 seconds)

**Expected:** Creates 17 tables + seeds reference data

**If you get policy errors, skip this step and go to Step 3.**

---

### Step 3: Clean Up Old Policies (If You Get Errors)

**If you got policy errors, run this:**

Copy the **ENTIRE contents** of: **`.same/CLEAN_MIGRATION.sql`**

- Paste into a NEW query
- Click **"Run"**

**What this does:**
- Drops all existing policies
- Recreates them correctly
- Enables RLS on all tables
- Grants permissions

**Expected:** "RLS Policies created successfully!"

---

### Step 4: Create Notifications Table

Copy the **ENTIRE contents** of: **`.same/notifications_migration_fixed.sql`**

- Paste into a NEW query
- Click **"Run"**

**Expected:** "corporate_notifications table created successfully!"

---

## ✅ Verification

After completing all steps, run this query to verify:

```sql
-- Check all tables exist
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'corporate%'
ORDER BY tablename;
```

**Expected tables (17-18 total):**
- corporate_matter_activity_logs
- corporate_matter_assignments
- corporate_matter_closures
- corporate_matter_document_versions
- corporate_matter_documents
- corporate_matter_notifications (old one, ignore)
- corporate_matter_reviews
- corporate_matter_status_history
- corporate_matter_tasks
- corporate_matters
- corporate_notifications ⭐ (the one you need)
- corporate_reference_confidentiality_levels
- corporate_reference_divisions
- corporate_reference_document_types
- corporate_reference_matter_types
- corporate_reference_priorities
- corporate_reference_request_forms
- corporate_reference_request_types

---

## 🔍 Check Policies

Run this to see all your policies:

```sql
-- Check RLS policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** Multiple policies for each table (view, create, update)

---

## 🧪 Test Notifications

```sql
-- Test 1: Check you're authenticated
SELECT auth.uid() as my_user_id;

-- Test 2: Create a test notification
INSERT INTO corporate_notifications (
    user_id,
    type,
    title,
    message
) VALUES (
    auth.uid(),
    'test',
    'Test Notification',
    'Notifications are working!'
);

-- Test 3: View your notifications
SELECT * FROM corporate_notifications
WHERE user_id = auth.uid();

-- Test 4: Clean up test
DELETE FROM corporate_notifications WHERE type = 'test';
```

---

## 🆘 Common Errors & Solutions

### Error: "policy already exists"
**Solution:** Run `.same/CLEAN_MIGRATION.sql` to drop and recreate policies

### Error: "relation does not exist"
**Solution:** Run `.same/database-schema-enhanced.sql` first to create tables

### Error: "sequence does not exist"
**Solution:** Use `.same/notifications_migration_fixed.sql` (not the original)

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner in Supabase

### Error: "auth.uid() returns null"
**Solution:**
1. First create a user by signing up in your app
2. Or create a test user in Supabase → Authentication
3. Then run the test queries

---

## 📁 Files Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `.same/database-schema-enhanced.sql` | Creates all 17 tables | First time only |
| `.same/CLEAN_MIGRATION.sql` | Fixes policy errors | If you get "already exists" errors ⭐ |
| `.same/notifications_migration_fixed.sql` | Creates notifications table | After main migration ⭐ |
| `.same/notifications_migration.sql` | Original (has bugs) | ❌ Don't use |

---

## ✅ Success Checklist

After completing migration:

- [ ] All 17-18 tables exist
- [ ] Policies created without errors
- [ ] Notifications table exists
- [ ] Test notification works
- [ ] You have Supabase credentials (URL + keys)
- [ ] `.env.local` configured with credentials
- [ ] App starts without errors: `bun run dev`

---

## 🎯 Next Steps After Migration

1. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

2. **Start the app:**
   ```bash
   cd corporatematters
   bun install
   bun run dev
   ```

3. **Create admin user:**
   - Sign up in your app at http://localhost:3000
   - Go to Supabase → Table Editor → `profiles`
   - Find your user row
   - Set `role` column to `system_administrator`
   - Refresh your app and log in again

4. **Test everything:**
   - Dashboard should load
   - Create a test matter
   - Check notifications bell (top-right)
   - Access admin panel at `/admin`

---

## 🎉 You're Done!

Once all migrations complete successfully, your database is ready and you can:
- ✅ Use the full application
- ✅ Deploy to production (Vercel/Netlify)
- ✅ Invite team members
- ✅ Start managing corporate matters!

---

*Migration Steps Guide*
*Fixes: Policy already exists errors*
*Date: March 7, 2026*
