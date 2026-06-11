'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Download,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  FileText,
  Columns3,
  Plus,
  X,
} from 'lucide-react';
import {
  WORKFLOW_STAGES,
  MATTER_STATUS,
  PRIORITIES,
  getWorkflowStageColor,
  getPriorityColor,
  isMatterOverdue,
  isMatterDueSoon,
} from '@/lib/workflow-constants';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];

type SortField = 'matter_number' | 'subject' | 'type_of_matter' | 'priority' | 'status' | 'workflow_stage' | 'date_received' | 'due_date' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const QUICK_FILTER_LABELS: Record<string, string> = {
  my: 'My Matters',
  active: 'Active',
  closed: 'Closed',
  pending_assignment: 'Pending Assignment',
  pending_review: 'Pending Review',
  overdue: 'Overdue',
};

function MattersPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    workflowStage: 'all',
    priority: 'all',
    matterType: 'all',
    dateRange: 'all',
    assignedOfficer: 'all',
  });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Column Visibility
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'matter_number', label: 'Matter Number', visible: true, sortable: true },
    { key: 'subject', label: 'Subject', visible: true, sortable: true },
    { key: 'type_of_matter', label: 'Type', visible: true, sortable: true },
    { key: 'priority', label: 'Priority', visible: true, sortable: true },
    { key: 'workflow_stage', label: 'Workflow Stage', visible: true, sortable: true },
    { key: 'status', label: 'Status', visible: true, sortable: true },
    { key: 'requester_name', label: 'Requester', visible: true, sortable: false },
    { key: 'requesting_division', label: 'Division', visible: false, sortable: false },
    { key: 'date_received', label: 'Date Received', visible: true, sortable: true },
    { key: 'due_date', label: 'Due Date', visible: true, sortable: true },
    { key: 'assigned_officer', label: 'Assigned To', visible: true, sortable: false },
  ]);

  // Map of user id -> display name, used to resolve the assigned officer.
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchMatters();
  }, []);

  // Sync search + quick filters from the URL (header search & sidebar links)
  useEffect(() => {
    setGlobalSearch(searchParams.get('search') || '');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');
    const view = searchParams.get('view');
    if (overdue === 'true') setQuickFilter('overdue');
    else if (view === 'my') setQuickFilter('my');
    else if (status) setQuickFilter(status);
    else setQuickFilter('all');
  }, [searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matters, globalSearch, filters, sortField, sortDirection, quickFilter, user]);

  const fetchMatters = async () => {
    try {
      const [mattersRes, profilesRes] = await Promise.all([
        supabase.from('corporate_matters').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email'),
      ]);

      if (mattersRes.error) throw mattersRes.error;
      setMatters(mattersRes.data || []);

      const map: Record<string, string> = {};
      (profilesRes.data || []).forEach((p: any) => {
        map[p.id] = p.full_name || (p.email ? p.email.split('@')[0] : 'Unknown');
      });
      setProfileMap(map);
    } catch (error) {
      console.error('Error fetching matters:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...matters];

    // Global search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.matter_number.toLowerCase().includes(searchLower) ||
          m.subject?.toLowerCase().includes(searchLower) ||
          m.type_of_matter.toLowerCase().includes(searchLower) ||
          m.requester_name.toLowerCase().includes(searchLower) ||
          m.requesting_division?.toLowerCase().includes(searchLower) ||
          m.legal_issues?.toLowerCase().includes(searchLower)
      );
    }

    // Quick filter (from header search / sidebar links)
    if (quickFilter !== 'all') {
      switch (quickFilter) {
        case 'my':
          filtered = filtered.filter((m) => m.assigned_officer === user?.id);
          break;
        case 'active':
          filtered = filtered.filter(
            (m) => m.status !== MATTER_STATUS.CLOSED && m.status !== MATTER_STATUS.COMPLETED
          );
          break;
        case 'closed':
          filtered = filtered.filter(
            (m) => m.status === MATTER_STATUS.CLOSED || m.status === MATTER_STATUS.COMPLETED
          );
          break;
        case 'pending_assignment':
          filtered = filtered.filter((m) => !m.assigned_officer);
          break;
        case 'pending_review':
          filtered = filtered.filter((m) => m.workflow_stage === WORKFLOW_STAGES.PENDING_REVIEW);
          break;
        case 'overdue':
          filtered = filtered.filter((m) => isMatterOverdue(m.due_date, m.status));
          break;
      }
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        filtered = filtered.filter((m) => isMatterOverdue(m.due_date, m.status));
      } else if (filters.status === 'due_soon') {
        filtered = filtered.filter((m) => isMatterDueSoon(m.due_date, m.status));
      } else {
        filtered = filtered.filter((m) => m.status === filters.status);
      }
    }

    // Workflow stage filter
    if (filters.workflowStage !== 'all') {
      filtered = filtered.filter((m) => m.workflow_stage === filters.workflowStage);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((m) => m.priority === filters.priority);
    }

    // Matter type filter
    if (filters.matterType !== 'all') {
      filtered = filtered.filter((m) => m.type_of_matter === filters.matterType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today.setHours(0, 0, 0, 0));
          filtered = filtered.filter((m) => new Date(m.created_at) >= startDate);
          break;
        case 'week':
          startDate = new Date(today.setDate(today.getDate() - 7));
          filtered = filtered.filter((m) => new Date(m.created_at) >= startDate);
          break;
        case 'month':
          startDate = new Date(today.setMonth(today.getMonth() - 1));
          filtered = filtered.filter((m) => new Date(m.created_at) >= startDate);
          break;
        case 'quarter':
          startDate = new Date(today.setMonth(today.getMonth() - 3));
          filtered = filtered.filter((m) => new Date(m.created_at) >= startDate);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle null/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // String comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredMatters(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (key: string) => {
    setColumns(columns.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      workflowStage: 'all',
      priority: 'all',
      matterType: 'all',
      dateRange: 'all',
      assignedOfficer: 'all',
    });
    setGlobalSearch('');
    setQuickFilter('all');
  };

  const exportToCSV = () => {
    // Build CSV header
    const visibleColumns = columns.filter(c => c.visible);
    const header = visibleColumns.map(c => c.label).join(',');

    // Build CSV rows
    const rows = paginatedMatters.map(matter => {
      return visibleColumns.map(col => {
        let value = matter[col.key as keyof Matter];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',');
    });

    // Combine and download
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matters-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredMatters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMatters = filteredMatters.slice(startIndex, endIndex);

  // Get unique values for filter dropdowns
  const uniqueMatterTypes = Array.from(new Set(matters.map(m => m.type_of_matter))).filter(Boolean);

  const visibleColumns = columns.filter(c => c.visible);
  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  // Quick-filter pills (counts computed from the full matter set)
  const quickFilters: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: matters.length },
    {
      key: 'my',
      label: 'My Matters',
      count: matters.filter((m) => m.assigned_officer === user?.id).length,
    },
    {
      key: 'active',
      label: 'Active',
      count: matters.filter(
        (m) => m.status !== MATTER_STATUS.CLOSED && m.status !== MATTER_STATUS.COMPLETED
      ).length,
    },
    {
      key: 'pending_assignment',
      label: 'Unassigned',
      count: matters.filter((m) => !m.assigned_officer).length,
    },
    {
      key: 'pending_review',
      label: 'In Review',
      count: matters.filter((m) => m.workflow_stage === WORKFLOW_STAGES.PENDING_REVIEW).length,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      count: matters.filter((m) => isMatterOverdue(m.due_date, m.status)).length,
    },
    {
      key: 'closed',
      label: 'Closed',
      count: matters.filter(
        (m) => m.status === MATTER_STATUS.CLOSED || m.status === MATTER_STATUS.COMPLETED
      ).length,
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-emerald-700">Loading matters...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Matter Register</h1>
            <p className="text-sm text-slate-500">
              Showing {filteredMatters.length} of {matters.length} matters
              {quickFilter !== 'all' && (
                <span className="text-emerald-700 font-medium">
                  {' '}· {QUICK_FILTER_LABELS[quickFilter] || quickFilter}
                </span>
              )}
            </p>
          </div>
          <Link href="/matters/new">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Register New Matter
            </Button>
          </Link>
        </div>

        {/* Quick-filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {quickFilters.map((qf) => {
            const active = quickFilter === qf.key;
            return (
              <button
                key={qf.key}
                onClick={() => setQuickFilter(qf.key)}
                className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {qf.label}
                <span
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50'
                  }`}
                >
                  {qf.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <Card className="border-slate-200">
          <CardContent className="p-3">
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Global Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by matter number, subject, requester, division..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-10 h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  {globalSearch && (
                    <button
                      onClick={() => setGlobalSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700' : ''}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Columns3 className="h-4 w-4 mr-2" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.key}
                        checked={col.visible}
                        onCheckedChange={() => toggleColumnVisibility(col.key)}
                      >
                        {col.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Button variant="outline" size="sm" onClick={fetchMatters}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-700">Advanced Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {Object.values(MATTER_STATUS).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                          <SelectItem value="overdue">⚠️ Overdue</SelectItem>
                          <SelectItem value="due_soon">⏰ Due in 3 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Workflow Stage Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Workflow Stage</Label>
                      <Select
                        value={filters.workflowStage}
                        onValueChange={(value) => setFilters({ ...filters, workflowStage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stages</SelectItem>
                          {Object.values(WORKFLOW_STAGES).map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(value) => setFilters({ ...filters, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          {Object.values(PRIORITIES).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Matter Type Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Matter Type</Label>
                      <Select
                        value={filters.matterType}
                        onValueChange={(value) => setFilters({ ...filters, matterType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {uniqueMatterTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Date Range</Label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="quarter">Last Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {visibleColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-3 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider ${
                          col.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                        }`}
                        onClick={() => col.sortable && handleSort(col.key as SortField)}
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {col.sortable && sortField === col.key && (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedMatters.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No matters found</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {globalSearch || activeFilterCount > 0
                            ? 'Try adjusting your filters or search'
                            : 'Register your first matter to get started'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedMatters.map((matter) => {
                      const isOverdue = isMatterOverdue(matter.due_date, matter.status);
                      const isDueSoon = isMatterDueSoon(matter.due_date, matter.status);

                      return (
                        <tr
                          key={matter.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-yellow-50' : ''
                          }`}
                        >
                          {visibleColumns.map((col) => (
                            <td key={col.key} className="px-3 py-2 text-sm">
                              {col.key === 'matter_number' && (
                                <Link href={`/matters/${matter.id}`}>
                                  <span className="font-medium text-emerald-700 hover:text-emerald-900 hover:underline">
                                    {matter.matter_number}
                                  </span>
                                </Link>
                              )}
                              {col.key === 'subject' && (
                                <div className="max-w-xs truncate" title={matter.subject || matter.type_of_matter}>
                                  {matter.subject || matter.type_of_matter}
                                </div>
                              )}
                              {col.key === 'type_of_matter' && (
                                <span className="text-slate-700">{matter.type_of_matter}</span>
                              )}
                              {col.key === 'priority' && (
                                <Badge variant="outline" className={getPriorityColor(matter.priority)}>
                                  {matter.priority}
                                </Badge>
                              )}
                              {col.key === 'workflow_stage' && (
                                <Badge variant="outline" className={getWorkflowStageColor(matter.workflow_stage)}>
                                  {matter.workflow_stage}
                                </Badge>
                              )}
                              {col.key === 'status' && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{matter.status}</Badge>
                                  {isOverdue && <span className="text-xs text-red-600">Overdue</span>}
                                  {isDueSoon && <span className="text-xs text-yellow-600">Due Soon</span>}
                                </div>
                              )}
                              {col.key === 'requester_name' && (
                                <span className="text-slate-700">{matter.requester_name}</span>
                              )}
                              {col.key === 'requesting_division' && (
                                <span className="text-slate-600">{matter.requesting_division || '-'}</span>
                              )}
                              {col.key === 'date_received' && (
                                <span className="text-slate-600">
                                  {format(new Date(matter.date_received), 'MMM dd, yyyy')}
                                </span>
                              )}
                              {col.key === 'due_date' && (
                                <span className={`${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : 'text-slate-600'}`}>
                                  {matter.due_date ? format(new Date(matter.due_date), 'MMM dd, yyyy') : '-'}
                                </span>
                              )}
                              {col.key === 'assigned_officer' && (
                                <span className={matter.assigned_officer ? 'text-slate-700' : 'text-slate-400'}>
                                  {matter.assigned_officer
                                    ? profileMap[matter.assigned_officer] || 'Assigned'
                                    : 'Unassigned'}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/matters/${matter.id}`} className="cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {!matter.assigned_officer && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/matters/${matter.id}/assign`} className="cursor-pointer">
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Assign Officer
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link href={`/matters/${matter.id}/details`} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredMatters.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-slate-600">Rows per page:</Label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredMatters.length)} of {filteredMatters.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function MattersPage() {
  return (
    <Suspense fallback={null}>
      <MattersPageContent />
    </Suspense>
  );
}
