'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { HelpLauncher } from '@/components/help/HelpButton';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Users,
  Database,
  Building2,
  FileText,
  Settings,
  Shield,
  BarChart3,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { canAccessAdmin, canManageUsers, canManageReferenceData, roleDescription } = usePermissions();

  useEffect(() => {
    if (!canAccessAdmin()) {
      router.push('/dashboard');
    }
  }, [canAccessAdmin, router]);

  if (!canAccessAdmin()) {
    return null;
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'border-l-blue-500',
      iconColor: 'text-blue-600',
      available: canManageUsers(),
    },
    {
      title: 'Reference Data',
      description: 'Manage divisions, matter types, and document types',
      icon: Database,
      href: '/admin/reference-data',
      color: 'border-l-green-500',
      iconColor: 'text-green-600',
      available: canManageReferenceData(),
    },
    {
      title: 'Divisions',
      description: 'Manage organizational divisions',
      icon: Building2,
      href: '/admin/divisions',
      color: 'border-l-orange-500',
      iconColor: 'text-orange-600',
      available: canManageReferenceData(),
    },
    {
      title: 'Matter Types',
      description: 'Manage types of corporate matters',
      icon: FileText,
      href: '/admin/matter-types',
      color: 'border-l-purple-500',
      iconColor: 'text-purple-600',
      available: canManageReferenceData(),
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'border-l-slate-500',
      iconColor: 'text-slate-600',
      available: canManageReferenceData(),
    },
    {
      title: 'Audit Log',
      description: 'View system activity and audit trail',
      icon: Shield,
      href: '/admin/audit',
      color: 'border-l-red-500',
      iconColor: 'text-red-600',
      available: canAccessAdmin(),
    },
  ];

  const availableSections = adminSections.filter((section) => section.available);

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
            <p className="text-sm text-slate-500">
              System management &amp; configuration · Your role: {roleDescription}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HelpLauncher label="Learn more" />
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 flex-shrink-0">
              <UserCog className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Quick Stats tiles */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Sessions', value: '-', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'System Health', value: 'Good', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 truncate">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${s.bg}`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 flex-shrink-0">
                        <Icon className={`h-5 w-5 ${section.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {section.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Help note */}
        <p className="text-xs text-slate-400">
          Administrative functions require proper permissions. Contact the system administrator if you need access to
          additional features.
        </p>
      </div>
    </AppLayout>
  );
}
