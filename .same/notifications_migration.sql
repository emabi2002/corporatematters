-- ============================================================================
-- CORPORATE NOTIFICATIONS TABLE MIGRATION
-- ============================================================================
-- This SQL should be run in Supabase SQL Editor to create the notifications table
--
-- Instructions:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- ============================================================================

-- Create corporate_notifications table
CREATE TABLE IF NOT EXISTS public.corporate_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    matter_id UUID REFERENCES public.corporate_matters(id) ON DELETE CASCADE,
    matter_number TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.corporate_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_matter_id ON public.corporate_notifications(matter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.corporate_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.corporate_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.corporate_notifications(user_id, is_read) WHERE is_read = false;

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_corporate_notifications_updated_at ON public.corporate_notifications;
CREATE TRIGGER update_corporate_notifications_updated_at
    BEFORE UPDATE ON public.corporate_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.corporate_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.corporate_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.corporate_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.corporate_notifications;
DROP POLICY IF EXISTS "System can create notifications for users" ON public.corporate_notifications;

-- Create RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.corporate_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
    ON public.corporate_notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.corporate_notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Authenticated users can create notifications (for system notifications)
CREATE POLICY "System can create notifications for users"
    ON public.corporate_notifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.corporate_notifications TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.corporate_notifications IS 'Stores user notifications for corporate matters system';
COMMENT ON COLUMN public.corporate_notifications.id IS 'Unique notification identifier';
COMMENT ON COLUMN public.corporate_notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN public.corporate_notifications.type IS 'Notification type (matter_assigned, draft_submitted, etc.)';
COMMENT ON COLUMN public.corporate_notifications.title IS 'Notification title/heading';
COMMENT ON COLUMN public.corporate_notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.corporate_notifications.matter_id IS 'Related matter ID (optional)';
COMMENT ON COLUMN public.corporate_notifications.matter_number IS 'Related matter number for display (optional)';
COMMENT ON COLUMN public.corporate_notifications.is_read IS 'Whether notification has been read';
COMMENT ON COLUMN public.corporate_notifications.created_at IS 'When notification was created';
COMMENT ON COLUMN public.corporate_notifications.updated_at IS 'When notification was last updated';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The corporate_notifications table is now ready to use!
--
-- Notification Types:
-- - matter_registered: New matter registered
-- - matter_assigned: Matter assigned to officer
-- - draft_submitted: Draft submitted for review
-- - draft_returned: Draft returned for revision
-- - draft_approved: Draft approved
-- - matter_due_soon: Matter due in 3 days
-- - matter_overdue: Matter is overdue
-- - matter_ready_for_closure: Matter ready to close
-- - matter_closed: Matter closed
-- ============================================================================
