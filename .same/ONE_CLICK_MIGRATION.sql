-- ============================================================================
-- DLPP CORPORATE MATTERS - ONE-CLICK MIGRATION
-- ============================================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This script can be run multiple times safely
-- It will create all tables, policies, and the notifications system
-- ============================================================================

-- ============================================================================
-- PART 1: Drop all existing objects to ensure clean slate
-- ============================================================================

-- Drop notification indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_matter_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_unread;

-- Drop notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON corporate_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON corporate_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON corporate_notifications;
DROP POLICY IF EXISTS "System can create notifications for users" ON corporate_notifications;

-- Drop notification trigger
DROP TRIGGER IF EXISTS update_corporate_notifications_updated_at ON corporate_notifications;

-- Drop notification table
DROP TABLE IF EXISTS corporate_notifications CASCADE;

-- Drop all RLS policies on main tables
DROP POLICY IF EXISTS "corporate_matters_view_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_insert_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_update_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_delete_policy" ON corporate_matters;
DROP POLICY IF EXISTS "Users can view matters" ON corporate_matters;
DROP POLICY IF EXISTS "Users can create matters" ON corporate_matters;
DROP POLICY IF EXISTS "Users can update matters" ON corporate_matters;

DROP POLICY IF EXISTS "profiles_view_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "documents_view_policy" ON corporate_matter_documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON corporate_matter_documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON corporate_matter_documents;
DROP POLICY IF EXISTS "Users can view documents" ON corporate_matter_documents;
DROP POLICY IF EXISTS "Users can upload documents" ON corporate_matter_documents;
DROP POLICY IF EXISTS "Users can delete documents" ON corporate_matter_documents;

DROP POLICY IF EXISTS "tasks_view_policy" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "Users can view tasks" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON corporate_matter_tasks;

DROP POLICY IF EXISTS "assignments_view_policy" ON corporate_matter_assignments;
DROP POLICY IF EXISTS "assignments_insert_policy" ON corporate_matter_assignments;
DROP POLICY IF EXISTS "Users can view assignments" ON corporate_matter_assignments;
DROP POLICY IF EXISTS "Users can create assignments" ON corporate_matter_assignments;

DROP POLICY IF EXISTS "reviews_view_policy" ON corporate_matter_reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON corporate_matter_reviews;
DROP POLICY IF EXISTS "Users can view reviews" ON corporate_matter_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON corporate_matter_reviews;

DROP POLICY IF EXISTS "activity_logs_view_policy" ON corporate_matter_activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_policy" ON corporate_matter_activity_logs;
DROP POLICY IF EXISTS "Users can view activity logs" ON corporate_matter_activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON corporate_matter_activity_logs;

DROP POLICY IF EXISTS "status_history_view_policy" ON corporate_matter_status_history;
DROP POLICY IF EXISTS "status_history_insert_policy" ON corporate_matter_status_history;
DROP POLICY IF EXISTS "Users can view status history" ON corporate_matter_status_history;
DROP POLICY IF EXISTS "Users can create status history" ON corporate_matter_status_history;

DROP POLICY IF EXISTS "closures_view_policy" ON corporate_matter_closures;
DROP POLICY IF EXISTS "closures_insert_policy" ON corporate_matter_closures;
DROP POLICY IF EXISTS "Users can view closures" ON corporate_matter_closures;
DROP POLICY IF EXISTS "Users can create closures" ON corporate_matter_closures;

DROP POLICY IF EXISTS "Users can view document versions" ON corporate_matter_document_versions;
DROP POLICY IF EXISTS "Users can create document versions" ON corporate_matter_document_versions;

-- ============================================================================
-- PART 2: Enable RLS on all tables
-- ============================================================================

ALTER TABLE IF EXISTS corporate_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_matter_document_versions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: Create RLS Policies (simplified for ease of use)
-- ============================================================================

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Corporate Matters (allow all authenticated users)
CREATE POLICY "Users can view matters"
  ON corporate_matters FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create matters"
  ON corporate_matters FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update matters"
  ON corporate_matters FOR UPDATE USING (auth.role() = 'authenticated');

-- Documents
CREATE POLICY "Users can view documents"
  ON corporate_matter_documents FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload documents"
  ON corporate_matter_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete documents"
  ON corporate_matter_documents FOR DELETE USING (auth.role() = 'authenticated');

-- Tasks
CREATE POLICY "Users can view tasks"
  ON corporate_matter_tasks FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tasks"
  ON corporate_matter_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tasks"
  ON corporate_matter_tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Assignments
CREATE POLICY "Users can view assignments"
  ON corporate_matter_assignments FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create assignments"
  ON corporate_matter_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reviews
CREATE POLICY "Users can view reviews"
  ON corporate_matter_reviews FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create reviews"
  ON corporate_matter_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Activity Logs
CREATE POLICY "Users can view activity logs"
  ON corporate_matter_activity_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create activity logs"
  ON corporate_matter_activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Status History
CREATE POLICY "Users can view status history"
  ON corporate_matter_status_history FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create status history"
  ON corporate_matter_status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Closures
CREATE POLICY "Users can view closures"
  ON corporate_matter_closures FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create closures"
  ON corporate_matter_closures FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Document Versions
CREATE POLICY "Users can view document versions"
  ON corporate_matter_document_versions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create document versions"
  ON corporate_matter_document_versions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- PART 4: Create Notifications Table
-- ============================================================================

CREATE TABLE corporate_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
    matter_number TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON corporate_notifications(user_id);
CREATE INDEX idx_notifications_matter_id ON corporate_notifications(matter_id);
CREATE INDEX idx_notifications_is_read ON corporate_notifications(is_read);
CREATE INDEX idx_notifications_created_at ON corporate_notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON corporate_notifications(user_id, is_read) WHERE is_read = false;

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER update_corporate_notifications_updated_at
    BEFORE UPDATE ON corporate_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on notifications
ALTER TABLE corporate_notifications ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their own notifications"
    ON corporate_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON corporate_notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON corporate_notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users"
    ON corporate_notifications FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- PART 5: Grant Permissions
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON corporate_notifications TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
  'Migration completed successfully!' as status,
  (SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'corporate%') as table_count,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') as policy_count;
