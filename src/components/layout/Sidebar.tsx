'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { usePermissionsRBAC } from '@/hooks/usePermissionsRBAC';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  CheckSquare,
  Bell,
  Settings,
  ClipboardList,
  Scale,
  ChevronDown,
  ChevronRight,
  FilePlus,
  Briefcase,
  BarChart3,
  UserCog,
  Users,
  Building2,
  FileType,
  Folder,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCog,
  Shield,
  LifeBuoy,
  GraduationCap,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requireAdmin?: boolean;
  moduleKey?: string; // RBAC module key
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SIDEBAR_OPEN_GROUPS_KEY = 'corporate_sidebar_open_groups';

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { canAccessAdmin, roleDescription } = usePermissions();
  const rbac = usePermissionsRBAC();
  const { profile } = useAuth();

  const navigationGroups: NavGroup[] = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      defaultOpen: true,
      items: [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, moduleKey: 'corporate_dashboard' },
      ],
    },
    {
      name: 'Matter Workflow',
      icon: Scale,
      defaultOpen: true,
      items: [
        { name: 'Register Matter', href: '/matters/new', icon: FilePlus, moduleKey: 'corporate_matters' },
        { name: 'My Matters', href: '/matters?view=my', icon: Briefcase, moduleKey: 'corporate_matters' },
        { name: 'Pending Assignment', href: '/matters?status=pending_assignment', icon: UserCheck, moduleKey: 'corporate_assignment' },
        { name: 'Pending Review', href: '/matters?status=pending_review', icon: FileCog, moduleKey: 'corporate_review' },
      ],
    },
    {
      name: 'Matter Register',
      icon: ClipboardList,
      defaultOpen: false,
      items: [
        { name: 'All Matters', href: '/matters', icon: FolderOpen, moduleKey: 'corporate_matters' },
        { name: 'Active Matters', href: '/matters?status=active', icon: Clock, moduleKey: 'corporate_matters' },
        { name: 'Closed Matters', href: '/matters?status=closed', icon: CheckCircle2, moduleKey: 'corporate_matters' },
        { name: 'Overdue Matters', href: '/matters?overdue=true', icon: AlertCircle, moduleKey: 'corporate_matters' },
      ],
    },
    {
      name: 'Management',
      icon: Folder,
      defaultOpen: false,
      items: [
        { name: 'Documents', href: '/documents', icon: FileText, moduleKey: 'corporate_documents' },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare, moduleKey: 'corporate_tasks' },
        { name: 'Notifications', href: '/notifications', icon: Bell, moduleKey: 'corporate_notifications' },
      ],
    },
    {
      name: 'Reports & Analytics',
      icon: BarChart3,
      defaultOpen: false,
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart3, moduleKey: 'corporate_reports' },
      ],
    },
    {
      name: 'Administration',
      icon: Settings,
      defaultOpen: true,
      items: [
        { name: 'Admin Panel', href: '/admin', icon: Settings, requireAdmin: true, moduleKey: 'corporate_users' },
        { name: 'User Management', href: '/admin/users', icon: Users, requireAdmin: true, moduleKey: 'corporate_users' },
        { name: 'Groups & Permissions', href: '/admin/groups', icon: Shield, requireAdmin: true, moduleKey: 'corporate_groups' },
        { name: 'Divisions', href: '/admin/divisions', icon: Building2, requireAdmin: true, moduleKey: 'corporate_divisions' },
        { name: 'Matter Types', href: '/admin/matter-types', icon: ClipboardList, requireAdmin: true, moduleKey: 'corporate_matter_types' },
        { name: 'Document Types', href: '/admin/document-types', icon: FileType, requireAdmin: true, moduleKey: 'corporate_document_types' },
        { name: 'Reference Data', href: '/admin/reference-data', icon: Folder, requireAdmin: true, moduleKey: 'corporate_reference' },
      ],
    },
    {
      name: 'Help & Training',
      icon: LifeBuoy,
      defaultOpen: false,
      items: [
        { name: 'Help Centre', href: '/help', icon: LifeBuoy },
        { name: 'Guided Tours', href: '/help?tour=welcome', icon: GraduationCap },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SIDEBAR_OPEN_GROUPS_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Ignore parse errors
      }
    }
    const initial: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      initial[group.name] = group.defaultOpen ?? false;
    });
    return initial;
  });

  // Persist open groups to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_OPEN_GROUPS_KEY, JSON.stringify(openGroups));
    }
  }, [openGroups]);

  // Auto-open the group that contains the current active page
  useEffect(() => {
    if (!pathname) return;
    navigationGroups.forEach((group) => {
      const hasActiveItem = group.items.some((item) => {
        if (item.href === '/dashboard') {
          return pathname === '/dashboard';
        }
        if (item.href.includes('?')) {
          return pathname === item.href.split('?')[0];
        }
        return pathname === item.href || pathname?.startsWith(item.href + '/');
      });
      if (hasActiveItem) {
        setOpenGroups((prev) =>
          prev[group.name] ? prev : { ...prev, [group.name]: true }
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isActiveItem = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    if (href.includes('?')) {
      const basePath = href.split('?')[0];
      return pathname === basePath;
    }

    return pathname === href || pathname?.startsWith(href + '/');
  };

  const isActiveGroup = (group: NavGroup) => {
    return group.items.some((item) => isActiveItem(item.href));
  };

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // If RBAC is still loading, show all items temporarily
        if (rbac.loading) {
          return true;
        }

        // If RBAC has permissions loaded, use them
        if (rbac.permissions.length > 0 || rbac.isSuperAdmin) {
          // If using RBAC and has module key, check RBAC permission
          if (item.moduleKey) {
            return rbac.canReadModule(item.moduleKey);
          }

          // Fallback to old permission check for backward compatibility
          if (item.requireAdmin) {
            return canAccessAdmin() || rbac.canAccessAdmin();
          }

          return true;
        }

        // If RBAC is not set up yet (no permissions loaded), show all menus to authenticated users
        // This allows access to the admin pages so users can set up RBAC
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <TooltipProvider delayDuration={150}>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        data-tour="sidebar"
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-slate-900 text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-center border-b border-slate-700 px-4">
          <div className={cn('transition-all duration-300', collapsed ? 'h-9 w-9' : 'flex items-center gap-3')}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dlpp-logo.svg" alt="DLPP" className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">DLPP Corporate</div>
                <div className="text-xs text-slate-400">Matters System</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-2">
          {visibleGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="text-slate-400 text-sm">No menus available</div>
              <div className="text-xs text-slate-500">Contact administrator</div>
            </div>
          ) : (
          <div className="space-y-1">
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups[group.name];
              const isGroupActive = isActiveGroup(group);

              const groupButton = (
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-slate-800',
                    collapsed && 'justify-center',
                    isGroupActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{group.name}</span>}
                  </div>
                  {!collapsed &&
                    (isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </button>
              );

              return (
                <div key={group.name} className="mb-2">
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{groupButton}</TooltipTrigger>
                      <TooltipContent side="right">{group.name}</TooltipContent>
                    </Tooltip>
                  ) : (
                    groupButton
                  )}

                  {!collapsed && isOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-4">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isActiveItem(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              'hover:bg-slate-800',
                              isActive
                                ? 'bg-emerald-600 text-white font-medium'
                                : 'text-slate-400 hover:text-white'
                            )}
                          >
                            <ItemIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {collapsed && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isActiveItem(item.href);

                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center justify-center rounded-lg p-2 transition-colors',
                                  'hover:bg-slate-800',
                                  isActive
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                )}
                              >
                                <ItemIcon className="h-4 w-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-2">
                              {item.name}
                              {item.badge && (
                                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </nav>

        {/* Footer: logged-in user */}
        <div className="flex-shrink-0 border-t border-slate-700 p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                    {profile ? getInitials(profile.full_name || profile.email) : 'U'}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="font-semibold">{profile?.full_name || 'User'}</div>
                <div className="text-slate-300">{roleDescription}</div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                {profile ? getInitials(profile.full_name || profile.email) : 'U'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {profile?.full_name || 'User'}
                </div>
                <div className="truncate text-xs text-slate-400">{roleDescription}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
