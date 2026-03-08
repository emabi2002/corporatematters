# 🚀 Run Notifications Migration NOW

## ⚡ Quick 3-Step Process (Takes 2 minutes)

### Step 1: Open Supabase SQL Editor

Click this link (opens in new tab):
👉 **[Open Supabase SQL Editor](https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new)**

Or manually navigate to:
- Supabase Dashboard → Your Project → SQL Editor → New Query

---

### Step 2: Copy the Migration SQL

Open file: `.same/notifications_migration.sql`

**Select ALL** (Ctrl+A / Cmd+A) and **Copy** (Ctrl+C / Cmd+C)

The file starts with:
```sql
-- ============================================================================
-- CORPORATE NOTIFICATIONS TABLE MIGRATION
-- ============================================================================
```

And ends with:
```sql
-- - matter_closed: Matter closed
-- ============================================================================
```

Copy the **ENTIRE** file (all 117 lines).

---

### Step 3: Paste and Run

1. Click in the SQL Editor text area
2. **Paste** (Ctrl+V / Cmd+V)
3. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

You should see:
```
Success. No rows returned
```

✅ **Migration Complete!**

---

## ✅ Verify It Worked

Run this command in your terminal:
```bash
cd corporatematters
node scripts/check-notifications.js
```

You should see:
```
✅ Notifications table exists!
✅ Supabase connection working
🎉 Notification system is ready!
```

---

## 🎉 You're Done!

Now restart your dev server:
```bash
bun run dev
```

Then test the notifications:
1. Go to any unassigned matter
2. Click "Assign Officer"
3. Select an officer and submit
4. **Check the notification bell** (top right) - it should show a red badge!
5. Click the bell to see the notification
6. Visit `/notifications` to see the full page

---

## 🆘 Troubleshooting

### "Table already exists" error
- The migration was already run
- Run the verification script to confirm
- You're good to go!

### "Permission denied" error
- Make sure you're logged into the correct Supabase project
- Check that you have admin/owner access

### Still not working?
- Check the `.env.local` file has the correct credentials
- Verify the Supabase project URL matches
- Reach out for help

---

## 📋 What This Migration Creates

✅ `corporate_notifications` table
✅ 5 performance indexes
✅ Auto-update trigger for timestamps
✅ Row Level Security (RLS) policies
✅ Proper permissions for authenticated users

---

**Ready? Go!** 🚀

[Click here to open Supabase SQL Editor](https://supabase.com/dashboard/project/yvnkyjnwvylrweyzvibs/sql/new)
