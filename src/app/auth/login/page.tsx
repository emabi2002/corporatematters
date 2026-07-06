'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Bump this on every login-related change so we can confirm the browser is
// running the latest bundle (visible in the badge under the form).
const BUILD_MARKER = 'v16';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // If this runs, client-side JS is executing and the app has hydrated.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Navigate to the dashboard as soon as the auth context confirms a signed-in
  // user. Using router.replace (client-side) instead of window.location keeps
  // the same JS execution context, so the session is NOT lost on redirect —
  // this is what previously caused the "bounces back to the empty login" loop
  // inside the sandboxed preview iframe (where localStorage is blocked).
  useEffect(() => {
    if (user) {
      setStatus('Success — redirecting to dashboard…');
      router.replace('/dashboard');
    }
  }, [user, router]);

  const doLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setStatus('Signing in…');
    console.log('[login] submit start for', trimmedEmail);

    try {
      await signIn(trimmedEmail, password);
      console.log('[login] signIn resolved — waiting for auth state / redirecting');
      setStatus('Signed in — redirecting…');
      toast.success('Login successful!');

      // The effect above navigates once `user` is populated. As a safety net,
      // also push after a short delay in case the auth listener is slow.
      setTimeout(() => router.replace('/dashboard'), 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      console.error('[login] error:', err);
      setErrorMsg(message);
      setStatus('');
      toast.error(message);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)' }}
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dlpp-logo.svg" alt="DLPP" className="h-12 w-12" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-slate-900">
            Corporate Matters System
          </CardTitle>
          <CardDescription className="text-center text-base">
            Department of Lands &amp; Physical Planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
                disabled={loading}
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
                disabled={loading}
                suppressHydrationWarning
              />
            </div>

            {errorMsg && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {status && !errorMsg && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {status}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Diagnostic badge: proves client JS is running + which build loaded */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span
              className={`inline-block h-2 w-2 rounded-full ${hydrated ? 'bg-emerald-500' : 'bg-slate-300'}`}
            />
            <span className="text-slate-400">
              {hydrated ? `App ready · build ${BUILD_MARKER}` : 'Loading app…'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
