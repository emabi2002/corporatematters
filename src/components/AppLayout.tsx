'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AppLayout auth check:', { user: !!user, profile: !!profile, loading });
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Matters', href: '/matters' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                DLPP Corporate Matters
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-white/10 text-white">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                    <span className="text-sm font-medium text-white">
                      {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block text-white">
                    {profile.full_name || profile.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                    {profile.role && (
                      <p className="text-xs text-slate-400 capitalize">
                        {profile.role.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20">
          <nav className="flex space-x-1 px-4 py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-emerald-50 hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
