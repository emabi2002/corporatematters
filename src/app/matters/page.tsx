'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format, isBefore, isAfter, addDays } from 'date-fns';
import Link from 'next/link';
import { MATTER_STATUS } from '@/lib/constants';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const supabase = createClient();

  useEffect(() => {
    fetchMatters();
  }, []);

  useEffect(() => {
    filterMatters();
  }, [matters, searchTerm, statusFilter]);

  const fetchMatters = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_matters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatters(data || []);
    } catch (error) {
      console.error('Error fetching matters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatters = () => {
    let filtered = [...matters];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.matter_number.toLowerCase().includes(term) ||
          m.requester_name.toLowerCase().includes(term) ||
          m.type_of_matter.toLowerCase().includes(term) ||
          m.requesting_division?.toLowerCase().includes(term)
      );
    }

    setFilteredMatters(filtered);
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
            <p className="mt-4 text-gray-600">Loading matters...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Corporate Matters</h1>
            <p className="text-slate-600 mt-1">Manage all corporate legal matters</p>
          </div>
          <Link href="/matters/new">
            <Button size="lg">Register New Matter</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Search by matter number, requester, type, or division..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {MATTER_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredMatters.length} of {matters.length} matters
        </div>

        {/* Matters List */}
        {filteredMatters.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-slate-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No matters match your filters'
                    : 'No matters registered yet'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/matters/new">
                    <Button className="mt-4">Register First Matter</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMatters.map((matter) => (
              <Link
                key={matter.id}
                href={`/matters/${matter.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {matter.matter_number}
                          </h3>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Type:</span>{' '}
                            <span className="text-slate-600">{matter.type_of_matter}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Request Type:</span>{' '}
                            <span className="text-slate-600">{matter.request_type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Requester:</span>{' '}
                            <span className="text-slate-600">{matter.requester_name}</span>
                          </div>
                          {matter.requesting_division && (
                            <div>
                              <span className="font-medium text-slate-700">Division:</span>{' '}
                              <span className="text-slate-600">{matter.requesting_division}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-sm whitespace-nowrap">
                        <p className="text-slate-600">
                          Received: {format(new Date(matter.date_received), 'MMM dd, yyyy')}
                        </p>
                        {matter.due_date && (
                          <p className={`font-medium mt-1 ${
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
