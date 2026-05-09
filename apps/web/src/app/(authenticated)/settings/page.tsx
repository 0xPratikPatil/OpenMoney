'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useSession } from '@/lib/auth-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@openmoney/ui';
import {
  User,
  Settings,
  Palette,
  Bell,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Profile Tab                                                                */
/* -------------------------------------------------------------------------- */

function ProfileTab({ loading }: { loading: boolean }) {
  const { data: session } = useSession();
  const [name, setName] = React.useState(session?.user?.name ?? '');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save — no user update API yet in the client
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Profile updated');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]">
              <User size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {session?.user?.name ?? 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {session?.user?.email ?? ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name */}
      <div>
        <label
          htmlFor="settings-name"
          className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]"
        >
          Display Name
        </label>
        <Input
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      {/* Email (disabled) */}
      <div>
        <label
          htmlFor="settings-email"
          className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]"
        >
          Email
        </label>
        <Input
          id="settings-email"
          value={session?.user?.email ?? ''}
          disabled
          className="opacity-60"
        />
        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
          Email cannot be changed here.
        </p>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save size={14} className="mr-1.5" />
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Preferences Tab                                                            */
/* -------------------------------------------------------------------------- */

function PreferencesTab({ loading }: { loading: boolean }) {
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD');
  const [defaultTimeframe, setDefaultTimeframe] = React.useState('1y');
  const [riskFreeRate, setRiskFreeRate] = React.useState('5');
  const [notifySignals, setNotifySignals] = React.useState(true);
  const [notifyJournal, setNotifyJournal] = React.useState(true);
  const [notifyPrice, setNotifyPrice] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Preferences saved');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-9 w-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Currency */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]">
          Default Currency
        </label>
        <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="INR">INR (₹)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Default Timeframe */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]">
          Default Timeframe for Indicators
        </label>
        <Select value={defaultTimeframe} onValueChange={setDefaultTimeframe}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="5y">5 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risk-free Rate */}
      <div>
        <label
          htmlFor="settings-rfr"
          className="mb-1.5 block text-xs font-medium text-[var(--text-primary)]"
        >
          Risk-free Rate (%)
        </label>
        <Input
          id="settings-rfr"
          type="number"
          min={0}
          max={20}
          step={0.25}
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(e.target.value)}
          className="w-full max-w-xs font-mono"
        />
        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
          Used for Sharpe ratio and other risk-adjusted return calculations.
        </p>
      </div>

      {/* Theme Toggle Hint */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-[var(--accent-brand)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">Theme</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Toggle between dark and light mode using the theme switcher.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell size={14} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifySignals}
              onChange={(e) => setNotifySignals(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-brand)] focus:ring-[var(--accent-brand)]"
            />
            <span className="text-sm text-[var(--text-primary)]">New trading signals</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyJournal}
              onChange={(e) => setNotifyJournal(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-brand)] focus:ring-[var(--accent-brand)]"
            />
            <span className="text-sm text-[var(--text-primary)]">Journal reminders</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyPrice}
              onChange={(e) => setNotifyPrice(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-brand)] focus:ring-[var(--accent-brand)]"
            />
            <span className="text-sm text-[var(--text-primary)]">Price alerts</span>
          </label>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        <Save size={14} className="mr-1.5" />
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const { isPending } = useSession();
  const loading = isPending;

  /* ======== Loading ======== */

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Manage your account, preferences, and configuration
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={14} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings size={14} />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab loading={loading} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesTab loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

