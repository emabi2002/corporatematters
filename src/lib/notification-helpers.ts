import { createClient } from '@/lib/supabase';
import { NOTIFICATION_TYPES, NOTIFICATION_LABELS } from '@/lib/workflow-constants';

type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  message: string;
  matterId?: string;
  matterNumber?: string;
};

/**
 * Create a notification in the database
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createClient();

  const { error } = await supabase.from('corporate_notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    matter_id: params.matterId || null,
    matter_number: params.matterNumber || null,
    is_read: false,
  });

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notification when a matter is assigned to an officer
 */
export async function notifyMatterAssigned(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  assignedBy: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.MATTER_ASSIGNED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_ASSIGNED],
    message: `Matter "${params.matterSubject}" has been assigned to you.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a draft is submitted for review
 */
export async function notifyDraftSubmitted(params: {
  reviewerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  submittedBy: string;
}) {
  await createNotification({
    userId: params.reviewerId,
    type: NOTIFICATION_TYPES.DRAFT_SUBMITTED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.DRAFT_SUBMITTED],
    message: `A draft for "${params.matterSubject}" is awaiting your review.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a draft is returned for revision
 */
export async function notifyDraftReturned(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  reviewedBy: string;
  comments?: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.DRAFT_RETURNED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.DRAFT_RETURNED],
    message: `Your draft for "${params.matterSubject}" has been returned for corrections.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a draft is approved
 */
export async function notifyDraftApproved(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  reviewedBy: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.DRAFT_APPROVED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.DRAFT_APPROVED],
    message: `Your draft for "${params.matterSubject}" has been approved.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a matter is due soon (3 days before)
 */
export async function notifyMatterDueSoon(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  dueDate: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.MATTER_DUE_SOON,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_DUE_SOON],
    message: `Matter "${params.matterSubject}" is due soon.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a matter becomes overdue
 */
export async function notifyMatterOverdue(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  dueDate: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.MATTER_OVERDUE,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_OVERDUE],
    message: `Matter "${params.matterSubject}" is now overdue!`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a matter is ready for closure
 */
export async function notifyMatterReadyForClosure(params: {
  managerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
}) {
  await createNotification({
    userId: params.managerId,
    type: NOTIFICATION_TYPES.MATTER_READY_FOR_CLOSURE,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_READY_FOR_CLOSURE],
    message: `Matter "${params.matterSubject}" is ready to be closed.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification when a matter is closed
 */
export async function notifyMatterClosed(params: {
  officerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
}) {
  await createNotification({
    userId: params.officerId,
    type: NOTIFICATION_TYPES.MATTER_CLOSED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_CLOSED],
    message: `Matter "${params.matterSubject}" has been closed.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Create notification for a new matter registration (for managers)
 */
export async function notifyMatterRegistered(params: {
  managerId: string;
  matterId: string;
  matterNumber: string;
  matterSubject: string;
  registeredBy: string;
}) {
  await createNotification({
    userId: params.managerId,
    type: NOTIFICATION_TYPES.MATTER_REGISTERED,
    title: NOTIFICATION_LABELS[NOTIFICATION_TYPES.MATTER_REGISTERED],
    message: `A new matter "${params.matterSubject}" has been registered and awaits assignment.`,
    matterId: params.matterId,
    matterNumber: params.matterNumber,
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('corporate_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('corporate_notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('corporate_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}
