# Database Schema Analysis - Current State vs Requirements

## Current Database Status

### ✅ **Tables That Already Exist**

#### 1. `profiles`
**Status:** ✅ EXISTS
**Records:** 3 users
**Columns:**
- id
- email
- full_name
- phone
- department
- role
- is_active
- created_at
- updated_at

**Current Users:**
- admin@dlpp.gov (role: admin)
- plo@lands.gov.pg (role: admin)
- admin@lands.gov.pg (role: admin)

**Issues:**
- ❌ Only has "admin" role, needs 9 specific legal roles
- ❌ Missing: division, position, active_cases_count

---

#### 2. `corporate_matters`
**Status:** ✅ EXISTS (empty)
**Columns (17 fields):**
- id
- matter_number
- type_of_matter
- request_form
- requester_name
- requester_position
- requesting_division
- date_requested
- date_received
- request_type
- land_description
- zoning
- survey_plan_no
- lease_type
- lease_commencement
- lease_expiry
- legal_issues
- organisation_responsible
- assigned_officer
- assigned_date
- status
- due_date
- created_by
- created_at
- updated_at

**Missing Critical Fields (~25 fields needed):**
- ❌ subject
- ❌ summary
- ❌ priority
- ❌ confidentiality_level
- ❌ workflow_stage
- ❌ review_status
- ❌ current_reviewer
- ❌ manager_instructions
- ❌ file_reference
- ❌ title_description
- ❌ title_file_reference
- ❌ survey_file_reference
- ❌ purchase_documents_reference
- ❌ ilg_name
- ❌ ilg_file_reference
- ❌ claims_allegations
- ❌ applicable_law
- ❌ relevant_stakeholders
- ❌ internal_remarks
- ❌ risk_classification
- ❌ finalized_at
- ❌ closed_at
- ❌ closed_by
- ❌ closure_notes
- ❌ days_open
- ❌ is_overdue
- ❌ returned_for_revision_count
- ❌ sla_days

---

#### 3. `corporate_matter_documents`
**Status:** ✅ EXISTS (empty)
**Current Columns:**
- id
- matter_id
- title
- doc_type
- storage_path
- file_size
- mime_type
- uploaded_by
- uploaded_at

**Missing Fields:**
- ❌ version
- ❌ is_draft
- ❌ is_final
- ❌ review_status
- ❌ visibility_level
- ❌ replaced_by
- ❌ parent_document_id
- ❌ category

---

#### 4. `corporate_matter_tasks`
**Status:** ✅ EXISTS (empty)
**Current Columns:**
- id
- matter_id
- task_type
- description
- assigned_officer
- due_date
- status
- created_at
- completed_at
- updated_at

**Missing Fields:**
- ❌ start_date
- ❌ dependencies
- ❌ review_required
- ❌ notes
- ❌ priority

---

### ❌ **Tables That DON'T Exist (Need to Create)**

1. ❌ `corporate_matter_assignments` - Assignment tracking with history
2. ❌ `corporate_matter_reviews` - Review workflow and comments
3. ❌ `corporate_matter_activity_logs` - Complete audit trail
4. ❌ `corporate_matter_status_history` - Status change tracking
5. ❌ `corporate_matter_notifications` - In-app notifications
6. ❌ `corporate_matter_closures` - Closure records
7. ❌ `corporate_matter_document_versions` - Document version history
8. ❌ `corporate_reference_divisions` - Divisions lookup
9. ❌ `corporate_reference_matter_types` - Matter types lookup
10. ❌ `corporate_reference_request_forms` - Request forms lookup
11. ❌ `corporate_reference_request_types` - Request types lookup
12. ❌ `corporate_reference_document_types` - Document types lookup
13. ❌ `corporate_reference_priorities` - Priority levels lookup
14. ❌ `corporate_reference_confidentiality_levels` - Confidentiality lookup

**Total: 14 new tables needed**

---

## Migration Strategy

### Option 1: ALTER Existing Tables + CREATE New Tables (RECOMMENDED)
**Pros:**
- ✅ Preserves any existing data
- ✅ Less disruptive
- ✅ Can be done incrementally
- ✅ Safer approach

**Cons:**
- ⚠️ More complex migration script
- ⚠️ Need to handle column additions carefully

**Steps:**
1. Add missing columns to `corporate_matters` (25 columns)
2. Add missing columns to `corporate_matter_documents` (8 columns)
3. Add missing columns to `corporate_matter_tasks` (5 columns)
4. Update `profiles` role values to use new legal roles
5. Create 14 new workflow/reference tables
6. Create triggers and functions
7. Update RLS policies
8. Seed reference data

---

### Option 2: DROP and Recreate (NOT RECOMMENDED)
**Pros:**
- ✅ Clean slate
- ✅ Simpler migration script

**Cons:**
- ❌ Loses all existing data
- ❌ Breaks current connections
- ❌ Risky

---

## Recommended Migration Plan

### Phase 1: Add Missing Columns (Non-Breaking Changes)

```sql
-- Add to corporate_matters
ALTER TABLE corporate_matters
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS confidentiality_level TEXT DEFAULT 'Internal',
  ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'Registered',
  ADD COLUMN IF NOT EXISTS review_status TEXT,
  ADD COLUMN IF NOT EXISTS current_reviewer UUID REFERENCES profiles(id),
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
  ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS closure_notes TEXT,
  ADD COLUMN IF NOT EXISTS days_open INTEGER,
  ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS returned_for_revision_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS requesting_organization TEXT;

-- Add to corporate_matter_documents
ALTER TABLE corporate_matter_documents
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status TEXT,
  ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES corporate_matter_documents(id),
  ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES corporate_matter_documents(id),
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Add to corporate_matter_tasks
ALTER TABLE corporate_matter_tasks
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS dependencies TEXT,
  ADD COLUMN IF NOT EXISTS review_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
```

### Phase 2: Create New Tables

All 14 new tables from the enhanced schema.

### Phase 3: Create Triggers and Functions

- Matter number generation
- Days open calculation
- Overdue flag calculation
- Updated_at timestamp

### Phase 4: Update RLS Policies

Role-based access for all new tables.

### Phase 5: Seed Reference Data

- Priorities
- Confidentiality levels
- Document types
- Default divisions
- Default matter types

---

## Final Database Structure Summary

### Total Tables: 18

**Core Tables (4):**
1. profiles (enhanced)
2. corporate_matters (enhanced - 45 columns)
3. corporate_matter_documents (enhanced)
4. corporate_matter_tasks (enhanced)

**Workflow Tables (7):**
5. corporate_matter_assignments
6. corporate_matter_reviews
7. corporate_matter_activity_logs
8. corporate_matter_status_history
9. corporate_matter_notifications
10. corporate_matter_closures
11. corporate_matter_document_versions

**Reference Tables (7):**
12. corporate_reference_divisions
13. corporate_reference_matter_types
14. corporate_reference_request_forms
15. corporate_reference_request_types
16. corporate_reference_document_types
17. corporate_reference_priorities
18. corporate_reference_confidentiality_levels

---

## Next Steps

1. **Review this analysis** - Confirm this matches your requirements
2. **Approve migration strategy** - ALTER existing + CREATE new (recommended)
3. **Create migration SQL script** - Safe, incremental migration
4. **Test on development** - Run migration script
5. **Verify structure** - Check all columns and tables
6. **Seed reference data** - Add lookup values
7. **Update TypeScript types** - Regenerate from new schema
8. **Begin application rebuild** - Start with Phase 1 modules

---

## Risk Assessment

**Low Risk:**
- ✅ Adding new columns (won't break existing code)
- ✅ Creating new tables (isolated from current system)
- ✅ Adding indexes (performance improvement)

**Medium Risk:**
- ⚠️ Modifying RLS policies (test thoroughly)
- ⚠️ Adding triggers (could affect performance)
- ⚠️ Changing user roles (need data migration)

**High Risk:**
- ❌ Dropping existing tables (DON'T DO THIS)
- ❌ Removing columns (NOT PLANNED)

---

**Recommendation:** ✅ Proceed with OPTION 1 (ALTER + CREATE) approach.

All changes are additive and backward-compatible with current system.
