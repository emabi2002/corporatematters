'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, Bell, Database, Lock, Save, Settings, Shield, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

const SETTINGS_STORAGE_KEY = 'corporate_matter_system_settings';

type SystemSettings = {
  defaultSlaDays: string;
  dueSoonWarningDays: string;
  enableNotifications: boolean;
  enableOverdueEscalation: boolean;
  requireClosureVerification: boolean;
  allowDocumentVersioning: boolean;
};

const defaultSettings: SystemSettings = {
  defaultSlaDays: '14',
  dueSoonWarningDays: '3',
  enableNotifications: true,
  enableOverdueEscalation: true,
  requireClosureVerification: true,
  allowDocumentVersioning: true,
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { canManageReferenceData } = usePermissions();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  useEffect(() => {
    if (!canManageReferenceData()) {
      router.push('/admin');
      return;
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      setSettings(defaultSettings);
    }
  }, [canManageReferenceData, router]);

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    toast.success('System settings saved for this browser session');
  };

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
              <p className="text-sm text-slate-500">Configure operational controls for corporate matter processing.</p>
            </div>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Route Connected</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                Workflow Defaults
              </CardTitle>
              <CardDescription>These values guide matter due dates, review alerts, and closure controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultSlaDays">Default SLA Days</Label>
                  <Input
                    id="defaultSlaDays"
                    type="number"
                    min="1"
                    value={settings.defaultSlaDays}
                    onChange={(e) => updateSetting('defaultSlaDays', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueSoonWarningDays">Due Soon Warning Days</Label>
                  <Input
                    id="dueSoonWarningDays"
                    type="number"
                    min="1"
                    value={settings.dueSoonWarningDays}
                    onChange={(e) => updateSetting('dueSoonWarningDays', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Enable Notifications</p>
                      <p className="text-sm text-slate-500">Allow system alerts for assignments, reviews, deadlines, and closures.</p>
                    </div>
                  </div>
                  <Switch checked={settings.enableNotifications} onCheckedChange={(v) => updateSetting('enableNotifications', v)} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Overdue Escalation</p>
                      <p className="text-sm text-slate-500">Flag overdue matters for management attention and reporting.</p>
                    </div>
                  </div>
                  <Switch checked={settings.enableOverdueEscalation} onCheckedChange={(v) => updateSetting('enableOverdueEscalation', v)} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Require Closure Verification</p>
                      <p className="text-sm text-slate-500">Require final output verification before a matter can be closed.</p>
                    </div>
                  </div>
                  <Switch checked={settings.requireClosureVerification} onCheckedChange={(v) => updateSetting('requireClosureVerification', v)} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Document Versioning</p>
                      <p className="text-sm text-slate-500">Maintain traceability of draft and final document versions.</p>
                    </div>
                  </div>
                  <Switch checked={settings.allowDocumentVersioning} onCheckedChange={(v) => updateSetting('allowDocumentVersioning', v)} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Implementation Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>This route removes the broken Admin Panel link and provides a safe configuration screen.</p>
              <p>For production, persist these settings in a Supabase table such as <span className="font-mono text-xs">corporate_system_settings</span> and enforce them in workflow actions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
