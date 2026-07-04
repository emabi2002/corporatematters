'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/NotificationBell';
import { HelpButton } from '@/components/help/HelpButton';
import { usePermissions } from '@/hooks/usePermissions';
import { createClient } from '@/lib/supabase';
import { getWorkflowStageColor } from '@/lib/workflow-constants';
import {
  Search,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Settings,
  LogOut,
  User,
  FileText,
  Briefcase,
  Loader2,
  CornerDownLeft,
  X,
} from 'lucide-react';

interface TopHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onMobileToggle?: () => void;
}

interface MatterResult {
  id: string;
  matter_number: string;
  subject: string | null;
  type_of_matter: string;
  workflow_stage: string;
  requester_name: string;
}

interface DocResult {
  id: string;
  title: string;
  doc_type: string | null;
  matter_id: string;
}

// Helper function to get initials from a name
function getInitials(name: string): string {
  if (!name) return 'U';

  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function TopHeader({
  sidebarCollapsed,
  onToggleSidebar,
  onMobileToggle,
}: TopHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { roleDescription, roleColor } = usePermissions();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [matterResults, setMatterResults] = useState<MatterResult[]>([]);
  const [docResults, setDocResults] = useState<DocResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Flattened result list for keyboard navigation (matters first, then docs)
  const flatResults: { href: string }[] = [
    ...matterResults.map((m) => ({ href: `/matters/${m.id}` })),
    ...docResults.map((d) => ({ href: `/matters/${d.matter_id}` })),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const goToResults = (q: string) => {
    setOpen(false);
    setMobileOpen(false);
    router.push(q ? `/matters?search=${encodeURIComponent(q)}` : '/matters');
  };

  const navigateTo = (href: string) => {
    setOpen(false);
    setMobileOpen(false);
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && flatResults[activeIndex]) {
      navigateTo(flatResults[activeIndex].href);
    } else {
      goToResults(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setMobileOpen(false);
    }
  };

  const runSearch = useCallback(
    async (raw: string) => {
      // Sanitize for PostgREST .or() syntax (commas / parens break the filter)
      const q = raw.replace(/[,()]/g, ' ').trim();
      if (q.length < 2) {
        setMatterResults([]);
        setDocResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const [matters, docs] = await Promise.all([
          supabase
            .from('corporate_matters')
            .select('id, matter_number, subject, type_of_matter, workflow_stage, requester_name')
            .or(
              `matter_number.ilike.%${q}%,subject.ilike.%${q}%,type_of_matter.ilike.%${q}%,requester_name.ilike.%${q}%`
            )
            .order('created_at', { ascending: false })
            .limit(6),
          supabase
            .from('corporate_matter_documents')
            .select('id, title, doc_type, matter_id')
            .ilike('title', `%${q}%`)
            .limit(4),
        ]);

        setMatterResults((matters.data as MatterResult[]) || []);
        setDocResults((docs.data as DocResult[]) || []);
      } catch (err) {
        console.error('Search error:', err);
        setMatterResults([]);
        setDocResults([]);
      } finally {
        setSearching(false);
      }
    },
    [supabase]
  );

  // Debounce the live search + reset keyboard highlight
  useEffect(() => {
    setActiveIndex(-1);
    if (searchQuery.trim().length < 2) {
      setMatterResults([]);
      setDocResults([]);
      return;
    }
    const t = setTimeout(() => runSearch(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery, runSearch]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Focus the mobile input when the mobile panel opens
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileOpen]);

  const hasResults = matterResults.length > 0 || docResults.length > 0;
  const showDesktop = open && searchQuery.trim().length >= 2;

  // Shared results list (used by both desktop dropdown and mobile panel)
  const renderResults = () => (
    <>
      <div className="max-h-[60vh] md:max-h-[26rem] overflow-y-auto">
        {!hasResults && !searching && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            No matches for &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {matterResults.length > 0 && (
          <div className="py-1">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Matters
            </p>
            {matterResults.map((m, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigateTo(`/matters/${m.id}`)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                    active ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {m.matter_number}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 flex-shrink-0 ${getWorkflowStageColor(m.workflow_stage)}`}
                      >
                        {m.workflow_stage}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {m.subject || m.type_of_matter}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {docResults.length > 0 && (
          <div className="py-1 border-t border-slate-100">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Documents
            </p>
            {docResults.map((d, j) => {
              const idx = matterResults.length + j;
              const active = idx === activeIndex;
              return (
                <button
                  key={d.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => navigateTo(`/matters/${d.matter_id}`)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                    active ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{d.title}</p>
                    <p className="text-xs text-slate-500 truncate">{d.doc_type || 'Document'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer action */}
      <button
        type="button"
        onClick={() => goToResults(searchQuery.trim())}
        className="flex w-full items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-slate-100 transition-colors"
      >
        <span className="truncate">Search all matters for &ldquo;{searchQuery.trim()}&rdquo;</span>
        <CornerDownLeft className="h-3.5 w-3.5 flex-shrink-0" />
      </button>
    </>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMobileToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileToggle}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Sidebar Toggle */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex text-slate-600 hover:text-slate-900"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Desktop smart search */}
        <div ref={searchRef} data-tour="header-search" className="relative hidden md:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search matters & documents..."
                className="pl-10 w-72 lg:w-96 bg-slate-50 border-slate-200 focus:bg-white"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
              )}
            </div>
          </form>

          {/* Desktop live results dropdown */}
          {showDesktop && (
            <div className="absolute left-0 top-full mt-2 w-[26rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              {renderResults()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-slate-600 hover:text-slate-900"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Contextual help */}
        <HelpButton variant="icon" className="hidden sm:inline-flex" />

        <span data-tour="notification-bell" className="inline-flex">
          <NotificationBell />
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2" data-tour="user-menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">
                  {profile ? getInitials(profile.full_name || profile.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-slate-700">
                {profile ? (profile.full_name || 'User') : 'Loading...'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
                {profile?.role && (
                  <Badge variant="outline" className={`${roleColor} mt-1`}>
                    {roleDescription}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 bg-white shadow-lg">
            <form onSubmit={handleSearch} className="flex items-center gap-2 border-b border-slate-100 p-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search matters & documents..."
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
            {searchQuery.trim().length >= 2 && (
              <div className="border-b border-slate-200">{renderResults()}</div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
