-- ============================================================================
-- DLPP CORPORATE MATTERS - CLEAN MIGRATION
-- ============================================================================
-- This migration can be run multiple times safely
-- It drops existing policies before recreating them
-- ============================================================================

-- STEP 1: Drop all existing RLS policies
-- ============================================================================

-- Drop policies on corporate_matters
DROP POLICY IF EXISTS "corporate_matters_view_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_insert_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_update_policy" ON corporate_matters;
DROP POLICY IF EXISTS "corporate_matters_delete_policy" ON corporate_matters;
DROP POLICY IF EXISTS "Users can view matters" ON corporate_matters;
DROP POLICY IF EXISTS "Users can create matters" ON corporate_matters;
DROP POLICY IF EXISTS "Users can update matters" ON corporate_matters;

-- Drop policies on profiles
DROP POLICY IF EXISTS "profiles_view_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Drop policies on corporate_matter_documents
DROP POLICY IF EXISTS "documents_view_policy" ON corporate_matter_documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON corporate_matter_documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON corporate_matter_documents;

-- Drop policies on corporate_matter_tasks
DROP POLICY IF EXISTS "tasks_view_policy" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON corporate_matter_tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON corporate_matter_tasks;

-- Drop policies on corporate_matter_assignments
DROP POLICY IF EXISTS "assignments_view_policy" ON corporate_matter_assignments;
DROP POLICY IF EXISTS "assignments_insert_policy" ON corporate_matter_assignments;

-- Drop policies on corporate_matter_reviews
DROP POLICY IF EXISTS "reviews_view_policy" ON corporate_matter_reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON corporate_matter_reviews;

-- Drop policies on corporate_matter_activity_logs
DROP POLICY IF EXISTS "activity_logs_view_policy" ON corporate_matter_activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert_policy" ON corporate_matter_activity_logs;

-- Drop policies on corporate_matter_status_history
DROP POLICY IF EXISTS "status_history_view_policy" ON corporate_matter_status_history;
DROP POLICY IF EXISTS "status_history_insert_policy" ON corporate_matter_status_history;

-- Drop policies on corporate_matter_closures
DROP POLICY IF EXISTS "closures_view_policy" ON corporate_matter_closures;
DROP POLICY IF EXISTS "closures_insert_policy" ON corporate_matter_closures;

-- ============================================================================
-- STEP 2: Enable RLS on all tables
-- ============================================================================

ALTER TABLE corporate_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_document_versions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create RLS Policies
-- ============================================================================

-- Profiles table policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Corporate matters policies (allow all authenticated users for now)
CREATE POLICY "Users can view matters"
  ON corporate_matters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create matters"
  ON corporate_matters FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update matters"
  ON corporate_matters FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Documents policies
CREATE POLICY "Users can view documents"
  ON corporate_matter_documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload documents"
  ON corporate_matter_documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete documents"
  ON corporate_matter_documents FOR DELETE
  USING (auth.role() = 'authenticated');

-- Tasks policies
CREATE POLICY "Users can view tasks"
  ON corporate_matter_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tasks"
  ON corporate_matter_tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update tasks"
  ON corporate_matter_tasks FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Assignments policies
CREATE POLICY "Users can view assignments"
  ON corporate_matter_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create assignments"
  ON corporate_matter_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Users can view reviews"
  ON corporate_matter_reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create reviews"
  ON corporate_matter_reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Activity logs policies
CREATE POLICY "Users can view activity logs"
  ON corporate_matter_activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create activity logs"
  ON corporate_matter_activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Status history policies
CREATE POLICY "Users can view status history"
  ON corporate_matter_status_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create status history"
  ON corporate_matter_status_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Closures policies
CREATE POLICY "Users can view closures"
  ON corporate_matter_closures FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create closures"
  ON corporate_matter_closures FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Document versions policies
CREATE POLICY "Users can view document versions"
  ON corporate_matter_document_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create document versions"
  ON corporate_matter_document_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 4: Grant permissions to authenticated users
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
  'RLS Policies created successfully!' as status,
  count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
