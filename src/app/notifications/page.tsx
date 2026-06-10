'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Clock,
  AlertCircle,
  Inbox,
  Archive,
  Plus,
  RotateCcw,
  Send,
} from 'lucide-react';
import { NOTIFICATION_LABELS } from '@/lib/workflow-constants';

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  matter_id: string | null;
  matter_number: string | null;
  is_read: boolean;
  created_at: string;
};

type Recipient = { id: string; full_name: string | null; email: string };

const NOTIFY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'reminder', label: 'Reminder' },
  ...Object.entries(NOTIFICATION_LABELS).map(([value, label]) => ({ value, label })),
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Compose dialog state
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [compose, setCompose] = useState({
    recipientId: 'me',
    type: 'announcement',
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      setRecipients((data as Recipient[]) || []);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('corporate_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('corporate_notifications')
        .update({ is_read: false })
        .eq('id', notificationId);
      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
      );
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleCompose = async () => {
    if (!compose.title.trim() || !compose.message.trim()) {
      toast.error('Please enter a title and message');
      return;
    }
    const targetUserId = compose.recipientId === 'me' ? currentUserId : compose.recipientId;
    if (!targetUserId) {
      toast.error('Please choose a recipient');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('corporate_notifications').insert({
        user_id: targetUserId,
        type: compose.type,
        title: compose.title.trim(),
        message: compose.message.trim(),
        is_read: false,
      } as never);
      if (error) throw error;
      toast.success('Notification sent');
      setComposeOpen(false);
      setCompose({ recipientId: 'me', type: 'announcement', title: '', message: '' });
      // Refresh if it was sent to the current user
      if (targetUserId === currentUserId) fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      const msg = error instanceof Error ? error.message : 'Failed to send notification';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('corporate_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('corporate_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('corporate_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('corporate_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('overdue')) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    if (type.includes('due_soon')) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    if (type.includes('assigned')) {
      return <Bell className="h-5 w-5 text-blue-600" />;
    }
    if (type.includes('approved')) {
      return <Check className="h-5 w-5 text-green-600" />;
    }
    return <Bell className="h-5 w-5 text-slate-600" />;
  };

  const getNotificationBadgeColor = (type: string) => {
    if (type.includes('overdue')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (type.includes('due_soon')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    if (type.includes('assigned')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (type.includes('approved')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (type.includes('returned')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'read') return n.is_read;
    return true; // 'all'
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;
  const actionCount = notifications.filter(
    (n) => n.type.includes('overdue') || n.type.includes('due_soon') || n.type.includes('returned')
  ).length;

  const summaryTiles = [
    { label: 'Total', value: notifications.length, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread', value: unreadCount, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Needs Action', value: actionCount, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Read', value: readCount, icon: CheckCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ] as const;

  const tabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: readCount },
  ];

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {readCount > 0 && (
              <Button variant="outline" size="sm" onClick={deleteAllRead}>
                <Archive className="h-4 w-4 mr-2" />
                Clear read
              </Button>
            )}
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setComposeOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryTiles.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{t.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{t.value}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${t.bg}`}>
                      <Icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {t.label}
                <span
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        <Card className="border-slate-200">
          <CardContent className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 text-center">
                  {activeTab === 'unread'
                    ? 'No unread notifications'
                    : activeTab === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 ${
                      !notification.is_read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Unread dot + icon */}
                    <div className="relative mt-0.5 flex-shrink-0">
                      {!notification.is_read && (
                        <span className="absolute -left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      <div className="scale-90">{getNotificationIcon(notification.type)}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm truncate ${
                            !notification.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`${getNotificationBadgeColor(notification.type)} text-[10px] py-0 px-1.5 whitespace-nowrap flex-shrink-0`}
                        >
                          {notification.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        {notification.matter_number && notification.matter_id && (
                          <Link
                            href={`/matters/${notification.matter_id}`}
                            onClick={() => markAsRead(notification.id)}
                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline whitespace-nowrap"
                          >
                            View {notification.matter_number} →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Actions (reveal on hover) */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-emerald-700"
                          title="Mark read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-emerald-700"
                          title="Mark unread"
                          onClick={() => markAsUnread(notification.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compose notification dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Notification</DialogTitle>
            <DialogDescription>Send a notification to yourself or another user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select
                  value={compose.recipientId}
                  onValueChange={(v) => setCompose((c) => ({ ...c, recipientId: v }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Myself</SelectItem>
                    {recipients.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.full_name || r.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={compose.type}
                  onValueChange={(v) => setCompose((c) => ({ ...c, type: v }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFY_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={compose.title}
                onChange={(e) => setCompose((c) => ({ ...c, title: e.target.value }))}
                placeholder="Notification title"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={compose.message}
                onChange={(e) => setCompose((c) => ({ ...c, message: e.target.value }))}
                placeholder="Write your message..."
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCompose}
              disabled={submitting || !compose.title.trim() || !compose.message.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
