-- ============================================================================
-- DLPP CORPORATE MATTERS SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- This schema is designed to run on the same Supabase project as the
-- Litigation Case Management System, reusing profiles/roles tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: corporate_matters
-- Core table for all corporate legal matters
-- ----------------------------------------------------------------------------
create table if not exists corporate_matters (
  id uuid primary key default gen_random_uuid(),

  -- Matter number will be set by trigger
  matter_number text unique,

  -- Basic matter information
  type_of_matter text not null,          -- legal clearance, legal advice, contract review, etc.
  request_form text not null,            -- verbal, whatsapp, note, email, memo, letter
  requester_name text not null,
  requester_position text,
  requesting_division text,
  date_requested date not null,
  date_received date not null,

  -- Request details
  request_type text not null,            -- legal opinion, legal brief, status brief, investigative brief

  -- Land/lease details (optional)
  land_description text,
  zoning text,
  survey_plan_no text,
  lease_type text,
  lease_commencement date,
  lease_expiry date,

  -- Matter details
  legal_issues text,
  organisation_responsible text,
  assigned_officer uuid references profiles(id),
  assigned_date date,
  status text default 'Pending',         -- Pending / In Progress / Completed / Closed
  due_date date,                         -- normally date_received + 14 days

  -- Audit fields
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_corporate_matters_status on corporate_matters (status);
create index if not exists idx_corporate_matters_assigned on corporate_matters (assigned_officer);
create index if not exists idx_corporate_matters_due_date on corporate_matters (due_date);
create index if not exists idx_corporate_matters_created_at on corporate_matters (created_at desc);
create index if not exists idx_corporate_matters_number on corporate_matters (matter_number);

-- Function to generate matter number
create or replace function generate_matter_number()
returns trigger as $
begin
  new.matter_number := 'CMS-' ||
    to_char(new.created_at, 'YYYYMMDD') || '-' ||
    lpad((extract(epoch from new.created_at)::bigint % 10000)::text, 4, '0');
  return new;
end;
$ language plpgsql;

-- Trigger to set matter number on insert
create trigger set_matter_number
  before insert on corporate_matters
  for each row
  execute function generate_matter_number();

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_corporate_matters_updated_at
  before update on corporate_matters
  for each row
  execute function update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Table: corporate_matter_documents
-- Store references to documents uploaded to Supabase Storage
-- ----------------------------------------------------------------------------
create table if not exists corporate_matter_documents (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references corporate_matters(id) on delete cascade,
  title text not null,
  doc_type text,              -- memo, background docs, draft opinion, final opinion, etc.
  storage_path text not null, -- Supabase Storage path
  file_size bigint,           -- File size in bytes
  mime_type text,             -- MIME type
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz default now()
);

create index if not exists idx_corporate_docs_matter on corporate_matter_documents (matter_id);
create index if not exists idx_corporate_docs_uploaded_at on corporate_matter_documents (uploaded_at desc);

-- ----------------------------------------------------------------------------
-- Table: corporate_matter_tasks
-- Track tasks/activities for each matter
-- ----------------------------------------------------------------------------
create table if not exists corporate_matter_tasks (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references corporate_matters(id) on delete cascade,
  task_type text,              -- legal opinion, status brief, investigative brief, vet instrument, etc.
  description text not null,
  assigned_officer uuid references profiles(id),
  due_date date,
  status text default 'Pending',     -- Pending / In Progress / Completed
  created_at timestamptz default now(),
  completed_at timestamptz,
  updated_at timestamptz default now()
);

create index if not exists idx_corporate_tasks_matter on corporate_matter_tasks (matter_id);
create index if not exists idx_corporate_tasks_status on corporate_matter_tasks (status);
create index if not exists idx_corporate_tasks_assigned on corporate_matter_tasks (assigned_officer);

create trigger update_corporate_tasks_updated_at
  before update on corporate_matter_tasks
  for each row
  execute function update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Row-Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table corporate_matters enable row level security;
alter table corporate_matter_documents enable row level security;
alter table corporate_matter_tasks enable row level security;

-- corporate_matters policies
-- Allow legal officers to view matters they're assigned to or created
create policy "Legal officers can view their matters"
  on corporate_matters for select
  using (
    auth.uid() in (
      select id from profiles
      where role in ('legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

-- Allow legal officers to create matters
create policy "Legal officers can create matters"
  on corporate_matters for insert
  with check (
    auth.uid() in (
      select id from profiles
      where role in ('legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

-- Allow updating matters (assigned officer or creator)
create policy "Officers can update their matters"
  on corporate_matters for update
  using (
    assigned_officer = auth.uid() or
    created_by = auth.uid() or
    auth.uid() in (
      select id from profiles
      where role in ('senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

-- corporate_matter_documents policies
create policy "Users can view documents for accessible matters"
  on corporate_matter_documents for select
  using (
    matter_id in (
      select id from corporate_matters
    )
  );

create policy "Users can upload documents"
  on corporate_matter_documents for insert
  with check (
    auth.uid() in (
      select id from profiles
      where role in ('legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

-- corporate_matter_tasks policies
create policy "Users can view tasks for accessible matters"
  on corporate_matter_tasks for select
  using (
    matter_id in (
      select id from corporate_matters
    )
  );

create policy "Users can create tasks"
  on corporate_matter_tasks for insert
  with check (
    auth.uid() in (
      select id from profiles
      where role in ('legal_officer', 'senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

create policy "Users can update tasks"
  on corporate_matter_tasks for update
  using (
    assigned_officer = auth.uid() or
    auth.uid() in (
      select id from profiles
      where role in ('senior_legal_officer', 'deputy_secretary', 'secretary')
    )
  );

-- ----------------------------------------------------------------------------
-- Storage Bucket (Run in Supabase Storage section)
-- ----------------------------------------------------------------------------
-- Create a bucket called 'corporate-matters' for document storage
-- Bucket policies should allow authenticated users to upload/download

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
