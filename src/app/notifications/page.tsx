'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Clock,
  AlertCircle,
  Inbox,
  Archive,
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Total Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{notifications.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Read
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{readCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({readCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-600 text-center">
                  {activeTab === 'unread'
                    ? 'No unread notifications'
                    : activeTab === 'read'
                    ? 'No read notifications'
                    : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all ${
                      !notification.is_read
                        ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`text-sm ${
                                  !notification.is_read ? 'font-semibold' : 'font-medium'
                                } text-slate-900`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.is_read && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {notification.message}
                            </p>
                            {notification.matter_number && notification.matter_id && (
                              <Link href={`/matters/${notification.matter_id}`}>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-emerald-700 hover:text-emerald-900"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  View {notification.matter_number} →
                                </Button>
                              </Link>
                            )}
                          </div>

                          {/* Type Badge */}
                          <Badge variant="outline" className={`${getNotificationBadgeColor(notification.type)} text-xs whitespace-nowrap`}>
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200">
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            <span className="mx-2">•</span>
                            {format(new Date(notification.created_at), 'MMM dd, yyyy h:mm a')}
                          </span>

                          {/* Actions */}
                          <div className="flex gap-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
