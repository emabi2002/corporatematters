'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Administration</h1>
          <p className="text-emerald-700 mt-1">System management and configuration</p>
          <p className="text-sm text-slate-600 mt-2">Your role: {roleDescription}</p>
        </div>

        {/* Welcome Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-6 w-6 text-emerald-600" />
              Welcome to the Admin Panel
            </CardTitle>
            <CardDescription>
              Manage users, reference data, and system settings. You have access to {availableSections.length} admin
              sections based on your role.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className={`border-l-4 ${section.color} hover:shadow-lg transition-shadow cursor-pointer h-full`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className={`h-5 w-5 ${section.iconColor}`} />
                          {section.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">-</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Sessions</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">-</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">System Health</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">Good</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Administrative functions require proper permissions. Contact the system administrator if you need access to
              additional features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  );
}
