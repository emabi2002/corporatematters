'use client';

import {
  LogIn,
  LayoutDashboard,
  FilePlus,
  UserCheck,
  Briefcase,
  UserPlus,
  FileClock,
  CheckCircle2,
  FolderOpen,
  MapPin,
  Scale,
  Users,
  FileCheck,
  History,
  FileText,
  CheckSquare,
  Bell,
  ClipboardList,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Building2,
  FileType,
  Files,
  Database,
  ShieldCheck,
  LifeBuoy,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  LogIn,
  LayoutDashboard,
  FilePlus,
  UserCheck,
  Briefcase,
  UserPlus,
  FileClock,
  CheckCircle2,
  FolderOpen,
  MapPin,
  Scale,
  Users,
  FileCheck,
  History,
  FileText,
  CheckSquare,
  Bell,
  ClipboardList,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Building2,
  FileType,
  Files,
  Database,
  ShieldCheck,
  LifeBuoy,
};

export function HelpTopicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? HelpCircle;
  return <Icon className={className} />;
}
