# 🔔 Notifications Setup Guide

## Quick Start

The notification system is built and ready! Follow these steps to activate it:

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Open your DLPP Corporate Matters project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration**
   - Open file: `.same/notifications_migration.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" or press Ctrl/Cmd + Enter

4. **Verify Success**
   ```sql
   -- Run this to verify table was created:
   SELECT * FROM corporate_notifications LIMIT 1;

   -- Check indexes:
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'corporate_notifications';
   ```

### Step 2: Test Notifications

1. **Assign a Matter**
   - Go to any unassigned matter
   - Click "Assign Officer"
   - Select an officer and submit
   - ✅ Officer should receive notification

2. **Check Notification Bell**
   - Red badge should appear on bell icon (top right)
   - Click bell to see dropdown
   - Notification should show: "Matter Assigned to You"

3. **View Full Page**
   - Click "View all notifications" in dropdown
   - OR navigate to `/notifications`
   - Should see notification card

4. **Test Actions**
   - Click "Mark as read" - Badge updates
   - Click "Delete" - Notification removed
   - Click matter number - Navigate to matter

---

## Features Available

✅ **Implemented:**
- Notification bell with unread count
- Notification dropdown (last 20)
- Full notifications page
- Mark as read/unread
- Delete notifications
- Real-time updates
- Matter assignment notifications

⏳ **Coming Soon:**
- Review notifications (draft submitted, approved, returned)
- Matter registration notifications
- SLA alerts (3 days before due)
- Overdue alerts (scheduled job)

---

## Troubleshooting

### "Table already exists" error
- Table may be already created from previous migration
- Check if table exists: `SELECT * FROM corporate_notifications;`
- If exists, skip migration
- If structure is different, drop and recreate:
  ```sql
  DROP TABLE IF EXISTS corporate_notifications CASCADE;
  -- Then run migration again
  ```

### Notifications not appearing
1. Check if migration ran successfully
2. Check browser console for errors
3. Verify RLS policies are enabled
4. Check if user is authenticated

### Badge not updating
1. Check real-time subscription in browser console
2. Refresh page manually
3. Check Supabase realtime is enabled for project

---

## Database Schema

```sql
CREATE TABLE corporate_notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    matter_id UUID REFERENCES corporate_matters(id),
    matter_number TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Next Steps

After notifications are working:

1. **Add Review Notifications**
   - Update review workflow to send notifications
   - Notify when draft submitted
   - Notify when draft approved/returned

2. **Add Registration Notifications**
   - Notify managers when new matter registered
   - Helps with assignment workflow

3. **Set Up Scheduled Alerts**
   - Create Supabase Edge Function
   - Check for due soon matters daily
   - Check for overdue matters daily
   - Send notifications automatically

---

## Support

If you encounter issues:
1. Check `.same/PHASE_5_NOTIFICATIONS_PROGRESS.md` for detailed docs
2. Review `src/lib/notification-helpers.ts` for helper functions
3. Check `src/components/NotificationBell.tsx` for UI code

Happy notifying! 🔔
