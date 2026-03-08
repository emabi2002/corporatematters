'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, eachMonthOfInterval, parseISO } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  FileText,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
  Timer,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Matter = Database['public']['Tables']['corporate_matters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: 'last_7_days',
  LAST_MONTH: 'last_month',
  LAST_QUARTER: 'last_quarter',
  LAST_YEAR: 'last_year',
  THIS_MONTH: 'this_month',
  THIS_YEAR: 'this_year',
  ALL_TIME: 'all_time',
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES.THIS_MONTH);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'This Month',
  });
  const [exporting, setExporting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateDateRange(selectedRange);
  }, [selectedRange]);

  const fetchData = async () => {
    try {
      const [mattersData, officersData] = await Promise.all([
        supabase.from('corporate_matters').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
      ]);

      setMatters(mattersData.data || []);
      setOfficers(officersData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDateRange = (range: string) => {
    const now = new Date();
    let from: Date;
    let to: Date = now;
    let label: string;

    switch (range) {
      case DATE_RANGES.TODAY:
        from = now;
        label = 'Today';
        break;
      case DATE_RANGES.LAST_7_DAYS:
        from = subDays(now, 7);
        label = 'Last 7 Days';
        break;
      case DATE_RANGES.LAST_MONTH:
        from = subMonths(now, 1);
        label = 'Last Month';
        break;
      case DATE_RANGES.LAST_QUARTER:
        from = subMonths(now, 3);
        label = 'Last Quarter';
        break;
      case DATE_RANGES.LAST_YEAR:
        from = subMonths(now, 12);
        label = 'Last Year';
        break;
      case DATE_RANGES.THIS_MONTH:
        from = startOfMonth(now);
        to = endOfMonth(now);
        label = 'This Month';
        break;
      case DATE_RANGES.THIS_YEAR:
        from = startOfYear(now);
        to = endOfYear(now);
        label = 'This Year';
        break;
      case DATE_RANGES.ALL_TIME:
      default:
        from = new Date(2020, 0, 1);
        label = 'All Time';
        break;
    }

    setDateRange({ from, to, label });
  };

  const filteredMatters = matters.filter((m) => {
    const receivedDate = new Date(m.date_received);
    return receivedDate >= dateRange.from && receivedDate <= dateRange.to;
  });

  // Calculate metrics
  const totalMatters = filteredMatters.length;
  const activeMatters = filteredMatters.filter((m) => m.status !== 'Closed').length;
  const closedMatters = filteredMatters.filter((m) => m.status === 'Closed').length;
  const overdueMatters = filteredMatters.filter((m) => {
    if (m.status === 'Closed' || !m.due_date) return false;
    return new Date(m.due_date) < new Date();
  }).length;

  // SLA Compliance
  const mattersWithSLA = filteredMatters.filter((m) => m.status === 'Closed' && m.due_date && m.closed_at);
  const withinSLA = mattersWithSLA.filter((m) => new Date(m.closed_at!) <= new Date(m.due_date!)).length;
  const slaCompliance = mattersWithSLA.length > 0 ? ((withinSLA / mattersWithSLA.length) * 100).toFixed(1) : '0.0';

  // Average turnaround
  const closedWithDates = filteredMatters.filter((m) => m.status === 'Closed' && m.closed_at);
  const avgTurnaround =
    closedWithDates.length > 0
      ? (
          closedWithDates.reduce((sum, m) => {
            const days = Math.floor(
              (new Date(m.closed_at!).getTime() - new Date(m.date_received).getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / closedWithDates.length
        ).toFixed(1)
      : '0.0';

  // Monthly trend data
  const monthlyTrendData = (() => {
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthMatters = matters.filter((m) => {
        const receivedDate = new Date(m.date_received);
        return receivedDate >= monthStart && receivedDate <= monthEnd;
      });

      return {
        month: format(month, 'MMM yyyy'),
        total: monthMatters.length,
        closed: monthMatters.filter((m) => m.status === 'Closed').length,
        active: monthMatters.filter((m) => m.status !== 'Closed').length,
      };
    });
  })();

  // Status distribution for pie chart
  const statusData = Object.entries(
    filteredMatters.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Priority distribution for bar chart
  const priorityData = Object.entries(
    filteredMatters.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Overdue aging buckets
  const agingBuckets = (() => {
    const openOverdue = filteredMatters.filter((m) => {
      if (m.status === 'Closed' || !m.due_date) return false;
      return new Date(m.due_date) < new Date();
    });

    const buckets = {
      '1-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '30+ days': 0,
    };

    openOverdue.forEach((m) => {
      const daysOverdue = differenceInDays(new Date(), new Date(m.due_date!));
      if (daysOverdue <= 7) buckets['1-7 days']++;
      else if (daysOverdue <= 14) buckets['8-14 days']++;
      else if (daysOverdue <= 30) buckets['15-30 days']++;
      else buckets['30+ days']++;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  })();

  // Matter age distribution (for all open matters)
  const ageDistribution = (() => {
    const openMatters = filteredMatters.filter((m) => m.status !== 'Closed');
    const buckets = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '30+ days': 0,
    };

    openMatters.forEach((m) => {
      const age = differenceInDays(new Date(), new Date(m.date_received));
      if (age <= 7) buckets['0-7 days']++;
      else if (age <= 14) buckets['8-14 days']++;
      else if (age <= 30) buckets['15-30 days']++;
      else buckets['30+ days']++;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  })();

  // Division distribution
  const divisionData = Object.entries(
    filteredMatters.reduce((acc, m) => {
      const div = m.requesting_division || 'Unknown';
      acc[div] = (acc[div] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 divisions

  // Officer workload
  const officerWorkload = officers
    .map((officer) => {
      const assignedMatters = filteredMatters.filter((m) => m.assigned_officer === officer.id);
      const active = assignedMatters.filter((m) => m.status !== 'Closed').length;
      const completed = assignedMatters.filter((m) => m.status === 'Closed').length;
      const avgDays =
        completed > 0
          ? assignedMatters
              .filter((m) => m.status === 'Closed' && m.closed_at)
              .reduce((sum, m) => {
                const days = Math.floor(
                  (new Date(m.closed_at!).getTime() - new Date(m.date_received).getTime()) / (1000 * 60 * 60 * 24)
                );
                return sum + days;
              }, 0) / completed
          : 0;

      return {
        name: officer.full_name || officer.email,
        active,
        completed,
        total: assignedMatters.length,
        avgDays: avgDays.toFixed(1),
      };
    })
    .filter((o) => o.total > 0)
    .sort((a, b) => b.total - a.total);

  const exportToCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Report Period', dateRange.label],
      ['Total Matters', totalMatters],
      ['Active Matters', activeMatters],
      ['Closed Matters', closedMatters],
      ['Overdue Matters', overdueMatters],
      ['SLA Compliance', `${slaCompliance}%`],
      ['Average Turnaround', `${avgTurnaround} days`],
    ];

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corporate-matters-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title
      pdf.setFontSize(20);
      pdf.text('DLPP Corporate Matters Report', pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`Period: ${dateRange.label}`, pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, 37, { align: 'center' });

      // Summary metrics
      let yPos = 50;
      pdf.setFontSize(14);
      pdf.text('Summary Metrics', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      const metrics = [
        ['Total Matters:', totalMatters],
        ['Closed Matters:', closedMatters],
        ['Active Matters:', activeMatters],
        ['Overdue Matters:', overdueMatters],
        ['SLA Compliance:', `${slaCompliance}%`],
        ['Avg Turnaround:', `${avgTurnaround} days`],
      ];

      metrics.forEach(([label, value]) => {
        pdf.text(`${label}`, 25, yPos);
        pdf.text(`${value}`, 100, yPos);
        yPos += 7;
      });

      // Add charts
      const chartsElement = document.getElementById('charts-container');
      if (chartsElement) {
        yPos += 10;
        const canvas = await html2canvas(chartsElement, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPos + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
      }

      pdf.save(`corporate-matters-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Period:</span>
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DATE_RANGES.TODAY}>Today</SelectItem>
                    <SelectItem value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</SelectItem>
                    <SelectItem value={DATE_RANGES.THIS_MONTH}>This Month</SelectItem>
                    <SelectItem value={DATE_RANGES.LAST_MONTH}>Last Month</SelectItem>
                    <SelectItem value={DATE_RANGES.LAST_QUARTER}>Last Quarter</SelectItem>
                    <SelectItem value={DATE_RANGES.THIS_YEAR}>This Year</SelectItem>
                    <SelectItem value={DATE_RANGES.LAST_YEAR}>Last Year</SelectItem>
                    <SelectItem value={DATE_RANGES.ALL_TIME}>All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1"></div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF} disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'Generating...' : 'PDF'}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Matters</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalMatters}</div>
              <p className="text-xs text-slate-500 mt-1">{dateRange.label}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Closed Matters</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{closedMatters}</div>
              <p className="text-xs text-slate-500 mt-1">
                {totalMatters > 0 ? ((closedMatters / totalMatters) * 100).toFixed(1) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Active Matters</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{activeMatters}</div>
              <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{overdueMatters}</div>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Average Turnaround
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700">{avgTurnaround}</div>
              <p className="text-sm text-slate-600 mt-2">days to complete</p>
              <p className="text-xs text-slate-500 mt-1">Based on {closedWithDates.length} closed matters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700">{slaCompliance}%</div>
              <p className="text-sm text-slate-600 mt-2">within deadline</p>
              <p className="text-xs text-slate-500 mt-1">
                {withinSLA} of {mattersWithSLA.length} matters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div id="charts-container" className="space-y-6">
          {/* Monthly Trend Chart */}
          {monthlyTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Monthly Trend Analysis
                </CardTitle>
                <CardDescription>Matter counts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="closed" stroke="#3b82f6" strokeWidth={2} name="Closed" />
                    <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={2} name="Active" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            {statusData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-emerald-600" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Priority Distribution Bar Chart */}
            {priorityData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Overdue Aging Analysis */}
            {overdueMatters > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-red-600" />
                    Overdue Aging Analysis
                  </CardTitle>
                  <CardDescription>Days overdue by bucket</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agingBuckets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Matter Age Distribution */}
            {activeMatters > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Open Matter Age Distribution
                  </CardTitle>
                  <CardDescription>Age of currently open matters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Division Distribution */}
            {divisionData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    Top Divisions
                  </CardTitle>
                  <CardDescription>Matters by requesting division</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={divisionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Officer Workload Chart */}
            {officerWorkload.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Officer Workload Comparison
                  </CardTitle>
                  <CardDescription>Active vs completed matters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={officerWorkload.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="active" fill="#f59e0b" name="Active" />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="officers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="officers">Officer Details</TabsTrigger>
            <TabsTrigger value="divisions">Division Details</TabsTrigger>
          </TabsList>

          {/* Officer Workload Table */}
          <TabsContent value="officers">
            <Card>
              <CardHeader>
                <CardTitle>Officer Performance Metrics</CardTitle>
                <CardDescription>Detailed workload and performance by officer</CardDescription>
              </CardHeader>
              <CardContent>
                {officerWorkload.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">No data available for selected period</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-sm font-medium text-slate-700">Officer</th>
                          <th className="text-right p-2 text-sm font-medium text-slate-700">Active</th>
                          <th className="text-right p-2 text-sm font-medium text-slate-700">Completed</th>
                          <th className="text-right p-2 text-sm font-medium text-slate-700">Total</th>
                          <th className="text-right p-2 text-sm font-medium text-slate-700">Avg Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officerWorkload.map((officer) => (
                          <tr key={officer.name} className="border-b hover:bg-slate-50">
                            <td className="p-2 text-sm text-slate-900">{officer.name}</td>
                            <td className="p-2 text-sm text-orange-700 text-right font-medium">{officer.active}</td>
                            <td className="p-2 text-sm text-green-700 text-right font-medium">{officer.completed}</td>
                            <td className="p-2 text-sm text-slate-900 text-right font-bold">{officer.total}</td>
                            <td className="p-2 text-sm text-slate-600 text-right">{officer.avgDays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Division Table */}
          <TabsContent value="divisions">
            <Card>
              <CardHeader>
                <CardTitle>Division Breakdown</CardTitle>
                <CardDescription>Matter distribution across divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium text-slate-700">Division</th>
                        <th className="text-right p-2 text-sm font-medium text-slate-700">Count</th>
                        <th className="text-right p-2 text-sm font-medium text-slate-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionData.map((division) => (
                        <tr key={division.name} className="border-b hover:bg-slate-50">
                          <td className="p-2 text-sm text-slate-900">{division.name}</td>
                          <td className="p-2 text-sm text-slate-900 text-right font-medium">{division.value}</td>
                          <td className="p-2 text-sm text-slate-600 text-right">
                            {((division.value / totalMatters) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
