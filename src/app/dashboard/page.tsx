'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueSoon: 0,
  });
  const [recentMatters, setRecentMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_matters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matters = (data || []) as Matter[];

      if (matters) {
        const today = new Date();
        const threeDaysFromNow = addDays(today, 3);

        const stats: DashboardStats = {
          total: matters.length,
          pending: matters.filter((m) => m.status === 'Pending').length,
          inProgress: matters.filter((m) => m.status === 'In Progress').length,
          completed: matters.filter((m) => m.status === 'Completed' || m.status === 'Closed').length,
          overdue: matters.filter(
            (m) =>
              m.due_date &&
              isBefore(new Date(m.due_date), today) &&
              m.status !== 'Completed' &&
              m.status !== 'Closed'
          ).length,
          dueSoon: matters.filter(
            (m) =>
              m.due_date &&
              isAfter(new Date(m.due_date), today) &&
              isBefore(new Date(m.due_date), threeDaysFromNow) &&
              m.status !== 'Completed' &&
              m.status !== 'Closed'
          ).length,
        };

        setStats(stats);
        setRecentMatters(matters.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'Completed' || status === 'Closed') return false;
    return isBefore(new Date(dueDate), new Date());
  };

  const isDueSoon = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'Completed' || status === 'Closed') return false;
    const today = new Date();
    const due = new Date(dueDate);
    const threeDaysFromNow = addDays(today, 3);
    return isAfter(due, today) && isBefore(due, threeDaysFromNow);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Dashboard</h1>
            <p className="text-emerald-700 mt-1">Overview of all corporate matters</p>
          </div>
          <Link href="/matters/new">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
              Register New Matter
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardDescription>Total Matters</CardDescription>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-4xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-4xl text-blue-600">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-4xl text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardDescription className="text-red-700">Overdue</CardDescription>
              <CardTitle className="text-4xl text-red-600">{stats.overdue}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardDescription className="text-orange-700">Due in 3 Days</CardDescription>
              <CardTitle className="text-4xl text-orange-600">{stats.dueSoon}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Matters */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matters</CardTitle>
            <CardDescription>Latest corporate matters registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMatters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-emerald-700">No matters registered yet</p>
                <Link href="/matters/new">
                  <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                    Register First Matter
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMatters.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/matters/${matter.id}`}
                    className="block p-4 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-slate-900 truncate">
                            {matter.matter_number}
                          </p>
                          <Badge variant="outline" className={getStatusColor(matter.status)}>
                            {matter.status}
                          </Badge>
                          {isOverdue(matter.due_date, matter.status) && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              Overdue
                            </Badge>
                          )}
                          {isDueSoon(matter.due_date, matter.status) && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              Due Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Type:</span> {matter.type_of_matter}
                        </p>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Requester:</span> {matter.requester_name}
                        </p>
                        {matter.requesting_division && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Division:</span> {matter.requesting_division}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-slate-600">
                          Received: {format(new Date(matter.date_received), 'MMM dd, yyyy')}
                        </p>
                        {matter.due_date && (
                          <p className={`font-medium ${
                            isOverdue(matter.due_date, matter.status)
                              ? 'text-red-600'
                              : isDueSoon(matter.due_date, matter.status)
                              ? 'text-orange-600'
                              : 'text-slate-600'
                          }`}>
                            Due: {format(new Date(matter.due_date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
