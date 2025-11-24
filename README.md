# DLPP Corporate Matters System

A comprehensive web application for managing corporate legal matters for the Department of Lands, Physical Planning and Surveying (DLPP).

## Features

### 1. Authentication & Access Control
- Secure login system for legal officers
- Role-based access (Legal Officer, Senior Legal Officer, Deputy Secretary, Secretary)
- Profile management

### 2. Matter Registration (Step 2)
- Complete registration form capturing:
  - Type of corporate matter
  - Form of request (verbal, WhatsApp, email, memo, letter)
  - Requester details
  - Request dates (requested & received)
  - Type of request (legal opinion, brief, etc.)
  - Land/lease details (optional)
  - Legal issues description
  - Officer assignment
- Auto-generated matter numbers (CMS-YYYYMMDD-XXXX)
- Automatic 14-day turnaround calculation

### 3. Document Management (Step 3)
- Upload and store documents in Supabase Storage
- Document categorization (memos, opinions, briefs, contracts, etc.)
- Download and delete capabilities
- File size and metadata tracking

### 4. Task Management (Steps 4 & 5)
- Create and assign tasks
- Task types: legal opinions, briefs, contract reviews, etc.
- Task status tracking (Pending, In Progress, Completed)
- Due date management
- Automatic matter status updates

### 5. Dashboard & Reporting
- Overview statistics
- Status breakdown (Pending, In Progress, Completed)
- Overdue matters tracking
- Due soon alerts (3-day warning)
- Recent matters list

### 6. Matter Details View
- Complete matter information display
- Tabbed interface for documents and tasks
- Status update capability
- Timeline tracking

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Package Manager**: Bun

## Setup Instructions

### Prerequisites
- Node.js 18+ or Bun runtime
- Supabase account and project

### 1. Database Setup

1. Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy and execute the contents of .same/database-schema.sql
   ```

2. Create a Storage bucket:
   - Go to Supabase Dashboard → Storage
   - Create a new bucket called `corporate-matters`
   - Set it to private (authenticated users only)

3. Create Storage policies (in Supabase Storage bucket policies):
   ```sql
   -- Allow authenticated users to upload
   create policy "Authenticated users can upload"
   on storage.objects for insert
   to authenticated
   with check (bucket_id = 'corporate-matters');

   -- Allow authenticated users to download
   create policy "Authenticated users can download"
   on storage.objects for select
   to authenticated
   using (bucket_id = 'corporate-matters');

   -- Allow users to delete their uploads
   create policy "Users can delete"
   on storage.objects for delete
   to authenticated
   using (bucket_id = 'corporate-matters');
   ```

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 3. Install Dependencies

```bash
bun install
```

### 4. Run Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## User Roles

The system supports four user roles (configured in the `profiles` table):

1. **legal_officer** - Basic legal officer with access to assigned matters
2. **senior_legal_officer** - Senior officer with broader access
3. **deputy_secretary** - Deputy Secretary with full access
4. **secretary** - Secretary with full administrative access

## Workflow

### Step 1: Login
- Users authenticate with email/password
- System verifies role and permissions

### Step 2: Register Matter
- Fill out comprehensive registration form
- System auto-generates matter number
- Due date automatically set to 14 days from receipt

### Step 3: Upload Documents
- Upload supporting documents, memos, background materials
- Categorize by document type
- Documents stored securely in Supabase Storage

### Step 4: Create Tasks
- Break down matter into actionable tasks
- Assign tasks to specific officers
- Set individual task due dates
- Track progress (Pending → In Progress → Completed)

### Step 5: Complete Work
- Upload final outputs (opinions, briefs, contracts)
- Mark tasks as completed
- System suggests closing matter when all tasks done

## Deadline Management

- **14-Day Turnaround**: All matters have a 14-day deadline from date received
- **3-Day Alert**: System highlights matters due within 3 days
- **Overdue Tracking**: Overdue matters are clearly marked in red
- **Dashboard Alerts**: Separate cards for overdue and due-soon matters

## Database Schema

### Tables

1. **corporate_matters** - Core matter records
2. **corporate_matter_documents** - Document references
3. **corporate_matter_tasks** - Task tracking
4. **profiles** - User profiles (shared with litigation system)

### Row-Level Security

All tables have RLS enabled to ensure:
- Legal officers can only access matters in their division
- Senior officers and above can view all matters
- Proper audit trails with created_by tracking

## Future Enhancements

- [ ] Email notifications for deadlines
- [ ] Edge function for automated 3-day reminders
- [ ] Export to PDF/CSV
- [ ] Advanced reporting and analytics
- [ ] Mobile responsiveness improvements
- [ ] Bulk operations
- [ ] Search with full-text indexing

## Support

For issues or questions, contact DLPP IT Support or refer to the system documentation.

## License

Proprietary - DLPP Government System
