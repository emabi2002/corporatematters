-- ============================================================================
-- DLPP CORPORATE MATTERS SYSTEM - ENHANCED ENTERPRISE SCHEMA
-- ============================================================================
-- Complete legal workflow system with review cycles, assignments,
-- document versioning, audit trails, and notifications
-- All tables prefixed with 'corporate_' for consistency
-- ============================================================================

-- ----------------------------------------------------------------------------
-- REFERENCE DATA TABLES
-- ----------------------------------------------------------------------------

-- Divisions/Organizations
CREATE TABLE IF NOT EXISTS corporate_reference_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matter Types
CREATE TABLE IF NOT EXISTS corporate_reference_matter_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Forms
CREATE TABLE IF NOT EXISTS corporate_reference_request_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Types
CREATE TABLE IF NOT EXISTS corporate_reference_request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Types
CREATE TABLE IF NOT EXISTS corporate_reference_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- 'initial', 'draft', 'final', 'supporting'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Priority Levels
CREATE TABLE IF NOT EXISTS corporate_reference_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL, -- 1=Urgent, 2=High, 3=Normal, 4=Low
  color_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confidentiality Levels
CREATE TABLE IF NOT EXISTS corporate_reference_confidentiality_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- CORE MATTER TABLE (ENHANCED)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS corporate_matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auto-generated matter number
  matter_number TEXT UNIQUE,

  -- Basic Information
  subject TEXT,
  summary TEXT,
  type_of_matter TEXT NOT NULL,
  request_form TEXT NOT NULL,

  -- Requester Information
  requester_name TEXT NOT NULL,
  requester_position TEXT,
  requesting_division TEXT,
  requesting_organization TEXT,

  -- Dates
  date_requested DATE NOT NULL,
  date_received DATE NOT NULL,
  due_date DATE,
  sla_days INTEGER DEFAULT 14,

  -- Request Details
  request_type TEXT NOT NULL,

  -- Land/Lease Details
  land_description TEXT,
  file_reference TEXT,
  title_description TEXT,
  title_file_reference TEXT,
  survey_plan_no TEXT,
  survey_file_reference TEXT,
  purchase_documents_reference TEXT,
  ilg_name TEXT,
  ilg_file_reference TEXT,
  zoning TEXT,
  lease_type TEXT,
  lease_commencement DATE,
  lease_expiry DATE,

  -- Legal Issues
  legal_issues TEXT,
  claims_allegations TEXT,
  applicable_law TEXT,
  relevant_stakeholders TEXT,
  internal_remarks TEXT,

  -- Classification
  priority TEXT DEFAULT 'Normal',
  confidentiality_level TEXT DEFAULT 'Internal',
  risk_classification TEXT,

  -- Workflow
  workflow_stage TEXT DEFAULT 'Registered',
  status TEXT DEFAULT 'Open',
  review_status TEXT,

  -- Assignment
  assigned_officer UUID REFERENCES profiles(id),
  assigned_date DATE,
  current_reviewer UUID REFERENCES profiles(id),
  manager_instructions TEXT,

  -- Completion
  finalized_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id),
  closure_notes TEXT,

  -- Metrics
  days_open INTEGER,
  is_overdue BOOLEAN DEFAULT false,
  returned_for_revision_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_corporate_matters_workflow_stage ON corporate_matters(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_status ON corporate_matters(status);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_assigned ON corporate_matters(assigned_officer);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_reviewer ON corporate_matters(current_reviewer);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_due_date ON corporate_matters(due_date);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_overdue ON corporate_matters(is_overdue);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_priority ON corporate_matters(priority);
CREATE INDEX IF NOT EXISTS idx_corporate_matters_created_at ON corporate_matters(created_at DESC);

-- ----------------------------------------------------------------------------
-- ASSIGNMENT TRACKING
-- ----------------------------------------------------------------------------

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

CREATE INDEX IF NOT EXISTS idx_corporate_assignments_matter ON corporate_matter_assignments(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_assignments_officer ON corporate_matter_assignments(assigned_to);

-- ----------------------------------------------------------------------------
-- REVIEW WORKFLOW
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS corporate_matter_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  document_id UUID REFERENCES corporate_matter_documents(id),
  reviewer UUID REFERENCES profiles(id),
  review_type TEXT, -- 'draft', 'final', 'revision'
  review_status TEXT, -- 'pending', 'approved', 'returned', 'escalated'
  review_comments TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_reviews_matter ON corporate_matter_reviews(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_reviews_reviewer ON corporate_matter_reviews(reviewer);
CREATE INDEX IF NOT EXISTS idx_corporate_reviews_status ON corporate_matter_reviews(review_status);

-- ----------------------------------------------------------------------------
-- DOCUMENTS WITH VERSIONING
-- ----------------------------------------------------------------------------

-- Enhanced documents table
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false;
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS review_status TEXT;
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'internal';
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES corporate_matter_documents(id);
ALTER TABLE corporate_matter_documents ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES corporate_matter_documents(id);

-- Document versions history
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

CREATE INDEX IF NOT EXISTS idx_corporate_doc_versions_document ON corporate_matter_document_versions(document_id);

-- ----------------------------------------------------------------------------
-- ENHANCED TASKS
-- ----------------------------------------------------------------------------

ALTER TABLE corporate_matter_tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE corporate_matter_tasks ADD COLUMN IF NOT EXISTS dependencies TEXT;
ALTER TABLE corporate_matter_tasks ADD COLUMN IF NOT EXISTS review_required BOOLEAN DEFAULT false;
ALTER TABLE corporate_matter_tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE corporate_matter_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';

-- ----------------------------------------------------------------------------
-- CLOSURES
-- ----------------------------------------------------------------------------

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

CREATE INDEX IF NOT EXISTS idx_corporate_closures_matter ON corporate_matter_closures(matter_id);

-- ----------------------------------------------------------------------------
-- ACTIVITY LOG / AUDIT TRAIL
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS corporate_matter_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES corporate_matters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL, -- 'created', 'assigned', 'status_changed', 'document_uploaded', etc.
  action_description TEXT,
  old_value TEXT,
  new_value TEXT,
  field_changed TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_activity_matter ON corporate_matter_activity_logs(matter_id);
CREATE INDEX IF NOT EXISTS idx_corporate_activity_user ON corporate_matter_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_activity_created ON corporate_matter_activity_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- STATUS HISTORY
-- ----------------------------------------------------------------------------

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

CREATE INDEX IF NOT EXISTS idx_corporate_status_history_matter ON corporate_matter_status_history(matter_id);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------

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

CREATE INDEX IF NOT EXISTS idx_corporate_notifications_user ON corporate_matter_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_notifications_read ON corporate_matter_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_corporate_notifications_created ON corporate_matter_notifications(created_at DESC);

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------

-- Auto-generate matter number
CREATE OR REPLACE FUNCTION generate_corporate_matter_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.matter_number := 'CMS-' ||
    TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' ||
    LPAD((EXTRACT(EPOCH FROM NEW.created_at)::BIGINT % 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_corporate_matter_number ON corporate_matters;
CREATE TRIGGER set_corporate_matter_number
  BEFORE INSERT ON corporate_matters
  FOR EACH ROW
  EXECUTE FUNCTION generate_corporate_matter_number();

-- Update timestamp
CREATE OR REPLACE FUNCTION update_corporate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_corporate_matters_timestamp ON corporate_matters;
CREATE TRIGGER update_corporate_matters_timestamp
  BEFORE UPDATE ON corporate_matters
  FOR EACH ROW
  EXECUTE FUNCTION update_corporate_updated_at();

-- Calculate days open
CREATE OR REPLACE FUNCTION calculate_corporate_days_open()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_open := EXTRACT(DAY FROM (NOW() - NEW.created_at));
  NEW.is_overdue := (NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE AND NEW.status != 'Closed');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_corporate_matter_metrics ON corporate_matters;
CREATE TRIGGER calculate_corporate_matter_metrics
  BEFORE INSERT OR UPDATE ON corporate_matters
  FOR EACH ROW
  EXECUTE FUNCTION calculate_corporate_days_open();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE corporate_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matter_notifications ENABLE ROW LEVEL SECURITY;

-- View policies (role-based)
CREATE POLICY "corporate_matters_view_policy" ON corporate_matters
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN (
        'legal_secretary',
        'legal_officer_corporate',
        'senior_legal_officer_corporate',
        'legal_officer_legislation',
        'manager_legal_services',
        'director_policy_legal',
        'deputy_secretary',
        'secretary',
        'system_administrator'
      )
    )
  );

-- Insert policies
CREATE POLICY "corporate_matters_insert_policy" ON corporate_matters
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('legal_secretary', 'manager_legal_services', 'system_administrator')
    )
  );

-- Update policies
CREATE POLICY "corporate_matters_update_policy" ON corporate_matters
  FOR UPDATE USING (
    auth.uid() = assigned_officer OR
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('manager_legal_services', 'director_policy_legal', 'system_administrator')
    )
  );

-- Similar policies for other tables...

-- ============================================================================
-- SEED REFERENCE DATA
-- ============================================================================

-- Priorities
INSERT INTO corporate_reference_priorities (name, level, color_code) VALUES
  ('Urgent', 1, '#ef4444'),
  ('High', 2, '#f97316'),
  ('Normal', 3, '#3b82f6'),
  ('Low', 4, '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Confidentiality Levels
INSERT INTO corporate_reference_confidentiality_levels (name, level) VALUES
  ('Public', 1),
  ('Internal', 2),
  ('Confidential', 3),
  ('Highly Confidential', 4)
ON CONFLICT (name) DO NOTHING;

-- Document Types
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

-- ============================================================================
-- END OF ENHANCED SCHEMA
-- ============================================================================
