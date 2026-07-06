'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { HelpLauncher } from '@/components/help/HelpButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, eachMonthOfInterval } from 'date-fns';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

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

// Progress-bar palettes (Overview-style)
const AGE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
const OVERDUE_COLORS = ['#fca5a5', '#f87171', '#ef4444', '#b91c1c'];

function statusColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('closed') || n.includes('complete')) return '#10b981';
  if (n.includes('progress')) return '#3b82f6';
  if (n.includes('open') || n.includes('new')) return '#f59e0b';
  if (n.includes('hold') || n.includes('pending') || n.includes('review')) return '#a855f7';
  if (n.includes('cancel') || n.includes('reject')) return '#ef4444';
  return '#64748b';
}

function priorityColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('urgent') || n.includes('critical') || n.includes('high')) return '#ef4444';
  if (n.includes('normal') || n.includes('medium') || n.includes('routine')) return '#10b981';
  if (n.includes('low')) return '#3b82f6';
  return '#f59e0b';
}

/** Overview-style horizontal distribution bars. */
function DistributionBars({
  data,
  total,
  colors,
  emptyText = 'No data',
}: {
  data: { name: string; value: number }[];
  total: number;
  colors: string[] | ((name: string, index: number) => string);
  emptyText?: string;
}) {
  const hasData = total > 0 && data.some((d) => d.value > 0);
  if (!hasData) {
    return <div className="py-8 text-center text-sm text-slate-400">{emptyText}</div>;
  }
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        const color = typeof colors === 'function' ? colors(d.name, i) : colors[i % colors.length];
        return (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-xs text-slate-600 truncate" title={d.name}>
              {d.name}
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-medium text-slate-700">
              {d.value} <span className="text-slate-400">({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">Loading reports...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const completionPct = totalMatters > 0 ? ((closedMatters / totalMatters) * 100).toFixed(0) : '0';

  const metricTiles = [
    { label: 'Total Matters', value: `${totalMatters}`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', sub: dateRange.label },
    { label: 'Closed', value: `${closedMatters}`, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50', sub: `${completionPct}% completion` },
    { label: 'Active', value: `${activeMatters}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'In progress' },
    { label: 'Overdue', value: `${overdueMatters}`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', sub: 'Needs attention' },
    { label: 'Avg Turnaround', value: `${avgTurnaround}`, suffix: 'd', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50', sub: `${closedWithDates.length} closed` },
    { label: 'SLA Compliance', value: `${slaCompliance}`, suffix: '%', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `${withinSLA}/${mattersWithSLA.length} on time` },
  ] as const;

  const axisTick = { fontSize: 11, fill: '#94a3b8' } as const;

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header (controls inline, Overview-style) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports &amp; Analytics</h1>
            <p className="text-sm text-slate-500">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex flex-wrap items-center gap-2" data-tour="reports-period">
            <HelpLauncher label="Learn more" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-500" />
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="h-9 w-[150px] text-sm">
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
            <Button variant="outline" size="sm" onClick={exportToCSV} className="h-9">
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF} disabled={exporting} className="h-9">
              <Download className="h-4 w-4 mr-1.5" />
              {exporting ? 'Generating...' : 'PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-9">
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Metric tiles (Overview-style) */}
        <div data-tour="reports-metrics" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metricTiles.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{m.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">
                        {m.value}
                        {'suffix' in m && m.suffix ? (
                          <span className="text-base font-semibold text-slate-400 ml-0.5">{m.suffix}</span>
                        ) : null}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.sub}</p>
                    </div>
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0', m.bg)}>
                      <Icon className={cn('h-5 w-5', m.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div id="charts-container" data-tour="reports-charts" className="space-y-4">
          {/* Monthly Trend (full width) */}
          {monthlyTrendData.length > 1 && (
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Monthly Trend Analysis
                  <span className="ml-auto text-xs font-normal text-slate-400">{dateRange.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyTrendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={axisTick} stroke="#cbd5e1" />
                    <YAxis tick={axisTick} stroke="#cbd5e1" allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" dot={false} />
                    <Line type="monotone" dataKey="closed" stroke="#3b82f6" strokeWidth={2} name="Closed" dot={false} />
                    <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={2} name="Active" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 2-column distribution grid (Overview-style progress bars) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <PieChartIcon className="h-4 w-4 text-emerald-600" />
                  Status Distribution
                  <span className="ml-auto text-xs font-normal text-slate-400">{totalMatters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1">
                <DistributionBars
                  data={statusData}
                  total={totalMatters}
                  colors={(name) => statusColor(name)}
                  emptyText="No matters in this period"
                />
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Priority Distribution
                  <span className="ml-auto text-xs font-normal text-slate-400">{totalMatters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1">
                <DistributionBars
                  data={priorityData}
                  total={totalMatters}
                  colors={(name) => priorityColor(name)}
                  emptyText="No matters in this period"
                />
              </CardContent>
            </Card>

            {/* Open Matter Age */}
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Open Matter Age
                  <span className="ml-auto text-xs font-normal text-slate-400">{activeMatters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1">
                <DistributionBars
                  data={ageDistribution}
                  total={activeMatters}
                  colors={AGE_COLORS}
                  emptyText="No open matters"
                />
              </CardContent>
            </Card>

            {/* Overdue Aging */}
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <Timer className="h-4 w-4 text-red-600" />
                  Overdue Aging
                  <span className="ml-auto text-xs font-normal text-slate-400">{overdueMatters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1">
                <DistributionBars
                  data={agingBuckets}
                  total={overdueMatters}
                  colors={OVERDUE_COLORS}
                  emptyText="No overdue matters"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail tables (flattened onto one page, side by side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Officer Performance */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Users className="h-4 w-4 text-emerald-600" />
                Officer Performance
                <span className="ml-auto text-xs font-normal text-slate-400">{officerWorkload.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {officerWorkload.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No data for selected period</div>
              ) : (
                <div className="max-h-[280px] overflow-y-auto pr-1">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Officer</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">Active</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">Done</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">Total</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">Avg d</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officerWorkload.map((officer) => (
                        <tr key={officer.name} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 text-xs text-slate-900 truncate max-w-[160px]">{officer.name}</td>
                          <td className="p-2 text-xs text-orange-700 text-right font-medium">{officer.active}</td>
                          <td className="p-2 text-xs text-green-700 text-right font-medium">{officer.completed}</td>
                          <td className="p-2 text-xs text-slate-900 text-right font-bold">{officer.total}</td>
                          <td className="p-2 text-xs text-slate-600 text-right">{officer.avgDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Division Breakdown */}
          <Card className="border-slate-200">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Building2 className="h-4 w-4 text-orange-600" />
                Division Breakdown
                <span className="ml-auto text-xs font-normal text-slate-400">{divisionData.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {divisionData.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No data for selected period</div>
              ) : (
                <div className="max-h-[280px] overflow-y-auto pr-1">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200">
                        <th className="text-left p-2 text-xs font-medium text-slate-500">Division</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">Count</th>
                        <th className="text-right p-2 text-xs font-medium text-slate-500">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionData.map((division) => (
                        <tr key={division.name} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 text-xs text-slate-900 truncate max-w-[200px]">{division.name}</td>
                          <td className="p-2 text-xs text-slate-900 text-right font-medium">{division.value}</td>
                          <td className="p-2 text-xs text-slate-600 text-right">
                            {totalMatters > 0 ? ((division.value / totalMatters) * 100).toFixed(1) : '0.0'}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
