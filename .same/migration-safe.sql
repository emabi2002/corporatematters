-- ============================================================================
-- DLPP CORPORATE MATTERS - SAFE INCREMENTAL MIGRATION
-- ============================================================================
-- This script safely enhances the existing database without breaking changes
-- All operations use IF NOT EXISTS / IF EXISTS to be idempotent
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHASE 1: ENHANCE EXISTING TABLES
-- ----------------------------------------------------------------------------

-- 1.1 Add Missing Columns to corporate_matters
ALTER TABLE corporate_matters
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS confidentiality_level TEXT DEFAULT 'Internal',
  ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'Registered',
  ADD COLUMN IF NOT EXISTS review_status TEXT,
  ADD COLUMN IF NOT EXISTS current_reviewer UUID,
  ADD COLUMN IF NOT EXISTS manager_instructions TEXT,
  ADD COLUMN IF NOT EXISTS file_reference TEXT,
  ADD COLUMN IF NOT EXISTS title_description TEXT,
  ADD COLUMN IF NOT EXISTS title_file_reference TEXT,
  ADD COLUMN IF NOT EXISTS survey_file_reference TEXT,
  ADD COLUMN IF NOT EXISTS purchase_documents_reference TEXT,
  ADD COLUMN IF NOT EXISTS ilg_name TEXT,
  ADD COLUMN IF NOT EXISTS ilg_file_reference TEXT,
  ADD COLUMN IF NOT EXISTS claims_allegations TEXT,
  ADD COLUMN IF NOT EXISTS applicable_law TEXT,
  ADD COLUMN IF NOT EXISTS relevant_stakeholders TEXT,
  ADD COLUMN IF NOT EXISTS internal_remarks TEXT,
  ADD COLUMN IF NOT EXISTS risk_classification TEXT,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by UUID,
  ADD COLUMN IF NOT EXISTS closure_notes TEXT,
  ADD COLUMN IF NOT EXISTS days_open INTEGER,
  ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS returned_for_revision_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS requesting_organization TEXT;

-- 1.2 Add Missing Columns to corporate_matter_documents
ALTER TABLE corporate_matter_documents
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status TEXT,
  ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS replaced_by UUID,
  ADD COLUMN IF NOT EXISTS parent_document_id UUID,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 1.3 Add Missing Columns to corporate_matter_tasks
ALTER TABLE corporate_matter_tasks
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS dependencies TEXT,
  ADD COLUMN IF NOT EXISTS review_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';

-- 1.4 Add Missing Columns to profiles (if needed)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT;

-- ----------------------------------------------------------------------------
-- PHASE 2: CREATE NEW REFERENCE TABLES
-- ----------------------------------------------------------------------------

-- 2.1 Divisions Reference
CREATE TABLE IF NOT EXISTS corporate_reference_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Matter Types Reference
CREATE TABLE IF NOT EXISTS corporate_reference_matter_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Request Forms Reference
CREATE TABLE IF NOT EXISTS corporate_reference_request_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Request Types Reference
CREATE TABLE IF NOT EXISTS corporate_reference_request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Document Types Reference
CREATE TABLE IF NOT EXISTS corporate_reference_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Priorities Reference
CREATE TABLE IF NOT EXISTS corporate_reference_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  color_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Confidentiality Levels Reference
CREATE TABLE IF NOT EXISTS corporate_reference_confidentiality_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- PHASE 3: CREATE WORKFLOW TABLES
-- ----------------------------------------------------------------------------

-- 3.1 Assignment Tracking
CREATE TABLE IF NOT EXISTS corporate_matter_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  instructions TEXT,
  due_date DATE,
  is_current BOOLEAN DEFAULT true,
  reassignment_reason TEXT,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_corporate_assignments_matter
  ON corporate_matter_assignments(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_assignments_officer
  ON corporate_matter_assignments(assigned_to);

-- 3.2 Review Workflow
CREATE TABLE IF NOT EXISTS corporate_matter_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  document_id UUID REFERENCES corporate_matter_documents(id),
  reviewer UUID REFERENCES profiles(id),
  review_type TEXT,
  review_status TEXT,
  review_comments TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_reviews_matter
  ON corporate_matter_reviews(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_reviews_reviewer
  ON corporate_matter_reviews(reviewer);

-- 3.3 Activity Log / Audit Trail
CREATE TABLE IF NOT EXISTS corporate_matter_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  action_description TEXT,
  old_value TEXT,
  new_value TEXT,
  field_changed TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_activity_matter
  ON corporate_matter_activity_logs(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_activity_created
  ON corporate_matter_activity_logs(created_at DESC);

-- 3.4 Status History
CREATE TABLE IF NOT EXISTS corporate_matter_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT,
  from_workflow_stage TEXT,
  to_workflow_stage TEXT,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_status_history_matter
  ON corporate_matter_status_history(matter_id);

-- 3.5 Notifications
CREATE TABLE IF NOT EXISTS corporate_matter_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal',
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_notifications_user
  ON corporate_matter_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_notifications_read
  ON corporate_matter_notifications(is_read);

-- 3.6 Closures
CREATE TABLE IF NOT EXISTS corporate_matter_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  closed_by UUID REFERENCES profiles(id),
  closure_date TIMESTAMPTZ DEFAULT NOW(),
  closure_reason TEXT,
  final_output_verified BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_corporate_closures_matter
  ON corporate_matter_closures(matter_id);

-- 3.7 Document Versions
CREATE TABLE IF NOT EXISTS corporate_matter_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES corporate_matter_documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  change_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_corporate_doc_versions_document
  ON corporate_matter_document_versions(document_id);

-- ----------------------------------------------------------------------------
-- PHASE 4: CREATE/UPDATE INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_corporate_matters_workflow_stage
  ON corporate_matters(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_priority
  ON corporate_matters(priority);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_overdue
  ON corporate_matters(is_overdue);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_reviewer
  ON corporate_matters(current_reviewer);

-- ----------------------------------------------------------------------------
-- PHASE 5: CREATE/UPDATE FUNCTIONS AND TRIGGERS
-- ----------------------------------------------------------------------------

-- 5.1 Calculate Days Open and Overdue Status
CREATE OR REPLACE FUNCTION calculate_corporate_days_open()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_open := EXTRACT(DAY FROM (NOW() - NEW.created_at));
  NEW.is_overdue := (
    NEW.due_date IS NOT NULL AND
    NEW.due_date < CURRENT_DATE AND
    NEW.status NOT IN ('Completed', 'Closed')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_corporate_matter_metrics ON corporate_matters;
CREATE TRIGGER calculate_corporate_matter_metrics
  BEFORE INSERT OR UPDATE ON corporate_matters
  FOR EACH ROW
  EXECUTE FUNCTION calculate_corporate_days_open();

-- ----------------------------------------------------------------------------
-- PHASE 6: SEED REFERENCE DATA
-- ----------------------------------------------------------------------------

-- 6.1 Priorities
INSERT INTO corporate_reference_priorities (name, level, color_code) VALUES
  ('Urgent', 1, '#ef4444'),
  ('High', 2, '#f97316'),
  ('Normal', 3, '#3b82f6'),
  ('Low', 4, '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- 6.2 Confidentiality Levels
INSERT INTO corporate_reference_confidentiality_levels (name, level) VALUES
  ('Public', 1),
  ('Internal', 2),
  ('Confidential', 3),
  ('Highly Confidential', 4)
ON CONFLICT (name) DO NOTHING;

-- 6.3 Document Types
INSERT INTO corporate_reference_document_types (name, category) VALUES
  ('Inter-office Memo', 'initial'),
  ('Letter', 'initial'),
  ('Email', 'initial'),
  ('WhatsApp Evidence', 'initial'),
  ('Background Paper', 'supporting'),
  ('Draft Legal Opinion', 'draft'),
  ('Final Legal Opinion', 'final'),
  ('Legal Brief', 'draft'),
  ('Status Brief', 'draft'),
  ('Draft Instrument', 'draft'),
  ('Final Instrument', 'final'),
  ('Draft Agreement/Contract', 'draft'),
  ('Signed Agreement/Contract', 'final'),
  ('Appeal Submission', 'supporting'),
  ('Court Order/Judgement', 'supporting'),
  ('Closure Document', 'final')
ON CONFLICT (name) DO NOTHING;

-- 6.4 Request Forms
INSERT INTO corporate_reference_request_forms (name) VALUES
  ('Verbal'),
  ('WhatsApp'),
  ('Email'),
  ('Memo'),
  ('Letter')
ON CONFLICT (name) DO NOTHING;

-- 6.5 Matter Types (Common DLPP corporate matters)
INSERT INTO corporate_reference_matter_types (name, description) VALUES
  ('Land Acquisition', 'Acquisition of land for government purposes'),
  ('Lease Agreement', 'Lease agreements and renewals'),
  ('Contract Review', 'Review of contracts and agreements'),
  ('Legal Opinion', 'Legal opinions and advice'),
  ('Instrument Preparation', 'Preparation of legal instruments'),
  ('ILG Matter', 'Incorporated Land Group matters'),
  ('Title Investigation', 'Investigation of land titles'),
  ('Dispute Resolution', 'Land and lease disputes'),
  ('Policy Advice', 'Policy and legislative advice')
ON CONFLICT (name) DO NOTHING;

-- 6.6 Request Types
INSERT INTO corporate_reference_request_types (name) VALUES
  ('Legal Opinion'),
  ('Legal Brief'),
  ('Contract Review'),
  ('Instrument Preparation'),
  ('Investigation'),
  ('Legal Advice'),
  ('Document Vetting')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- PHASE 7: ENABLE RLS ON NEW TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE corporate_matter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_document_versions ENABLE ROW LEVEL SECURITY;

-- Basic view policies (can be refined later)
CREATE POLICY "corporate_assignments_view_policy" ON corporate_matter_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "corporate_reviews_view_policy" ON corporate_matter_reviews
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "corporate_activity_logs_view_policy" ON corporate_matter_activity_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "corporate_status_history_view_policy" ON corporate_matter_status_history
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "corporate_notifications_view_policy" ON corporate_matter_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "corporate_closures_view_policy" ON corporate_matter_closures
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "corporate_doc_versions_view_policy" ON corporate_matter_document_versions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Regenerate TypeScript types from new schema
-- 2. Update constants and enums
-- 3. Begin building workflow modules
-- ============================================================================
