# 🚀 Quick Migration Guide - Fix Notifications Error

## ✅ How to Fix the Error

You got this error because the notifications table migration had a sequence issue. Here's how to fix it:

---

## Step 1: Run the Main Database Migration

**Open Supabase Dashboard:**
1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

**Copy and run this file:**
- File: `.same/database-schema-enhanced.sql`
- Copy the entire contents
- Paste into SQL Editor
- Click "Run" (or Ctrl+Enter)

This creates all 17 tables including:
- corporate_matters
- corporate_matter_documents
- corporate_matter_tasks
- profiles
- And all reference data tables

**Expected result:** ✅ "Success. No rows returned" or similar

---

## Step 2: Run the Fixed Notifications Migration

**Use the FIXED version:**
- File: `.same/notifications_migration_fixed.sql` ⭐ **Use this one!**
- Copy the entire contents
- Paste into a new SQL query
- Click "Run"

**Expected result:** ✅ Table created successfully with verification message

---

## Step 3: Verify Everything Works

Run this query in SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'corporate%'
ORDER BY table_name;
```

**You should see these tables:**
- corporate_matter_activity_logs
- corporate_matter_assignments
- corporate_matter_closures
- corporate_matter_document_versions
- corporate_matter_documents
- corporate_matter_notifications (old, can ignore)
- corporate_matter_reviews
- corporate_matter_status_history
- corporate_matter_tasks
- corporate_matters
- corporate_notifications ⭐ **This is the one you need!**
- corporate_reference_confidentiality_levels
- corporate_reference_divisions
- corporate_reference_document_types
- corporate_reference_matter_types
- corporate_reference_priorities
- corporate_reference_request_forms
- corporate_reference_request_types

**Count:** Should be 17-18 tables total

---

## Step 4: Test Notifications

Run this test query:

```sql
-- Test: Get current user ID (should return your user)
SELECT auth.uid() as my_user_id;

-- Test: Try to insert a test notification
INSERT INTO corporate_notifications (
    user_id,
    type,
    title,
    message,
    is_read
) VALUES (
    auth.uid(),
    'test',
    'Test Notification',
    'If you can see this, notifications are working!',
    false
);

-- Test: View your notifications
SELECT * FROM corporate_notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

**Expected result:** ✅ Test notification appears

---

## 🆘 Troubleshooting

### Error: "relation corporate_matters does not exist"
**Solution:** Run the main migration first (`.same/database-schema-enhanced.sql`)

### Error: "permission denied"
**Solution:** Make sure you're logged into Supabase Dashboard as an admin

### Error: Still getting sequence error
**Solution:**
1. Drop the old table: `DROP TABLE IF EXISTS corporate_notifications CASCADE;`
2. Run the fixed migration: `.same/notifications_migration_fixed.sql`

### Error: "auth.uid() returns null"
**Solution:**
- Create a user first through your app's signup
- Or use a specific UUID instead of `auth.uid()` for testing

---

## ✅ Quick Checklist

Run these in order:

- [ ] **Step 1:** Run `.same/database-schema-enhanced.sql`
- [ ] **Step 2:** Run `.same/notifications_migration_fixed.sql` ⭐
- [ ] **Step 3:** Verify tables exist (query above)
- [ ] **Step 4:** Test notifications (query above)
- [ ] **Step 5:** Delete test notification: `DELETE FROM corporate_notifications WHERE type = 'test';`

---

## 🎯 After Migration

Once migrations are complete:

1. **Update your `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

2. **Start your app:**
   ```bash
   bun run dev
   ```

3. **Create first user:**
   - Visit http://localhost:3000
   - Sign up with email/password
   - Go to Supabase → Table Editor → profiles
   - Find your user and set `role` to `system_administrator`

4. **Test the app:**
   - Log in
   - Go to Dashboard
   - Try creating a matter
   - Check notifications bell (top-right)

---

## 📋 File Reference

**Main Migration:**
- `.same/database-schema-enhanced.sql` - Creates all 17 tables

**Notifications Migration (FIXED):**
- `.same/notifications_migration_fixed.sql` ⭐ **Use this!**
- `.same/notifications_migration.sql` - Original (has sequence error)

**Documentation:**
- `.same/DEPLOYMENT_SUCCESS.md` - Full deployment guide
- `.same/SECURITY_UPDATE.md` - Security update info
- `README.md` - Project overview

---

## 🎉 Success!

After running both migrations, you'll have:
- ✅ All 17 corporate tables
- ✅ Notifications system
- ✅ Reference data seeded
- ✅ RLS policies enabled
- ✅ Triggers and functions active
- ✅ Ready for production!

**Need help?** Check `.same/DEPLOYMENT_SUCCESS.md` for detailed deployment guide.

---

*Quick Migration Guide*
*Fixed: Notifications sequence error*
*Date: March 7, 2026*
