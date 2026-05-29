'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Switch, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from '@openmoney/ui';
import { Settings, User, Key, Bell, Palette, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Settings size={18} /> Settings</h1>
        <p className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">Manage your account, preferences, and API keys</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User size={13} /> Profile</TabsTrigger>
          <TabsTrigger value="providers"><Key size={13} /> API Keys</TabsTrigger>
          <TabsTrigger value="notifications"><Bell size={13} /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette size={13} /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Profile Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Display Name</Label><Input placeholder="Your name" /></div>
                <div><Label>Email</Label><Input placeholder="you@email.com" disabled /></div>
              </div>
              <div><Label>Default Currency</Label><Input defaultValue="USD" /></div>
              <Button size="sm"><Save size={13} /> Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="mt-4 space-y-4">
          {[
            { name: 'Polygon.io', desc: 'Real-time & historical market data' },
            { name: 'Financial Modeling Prep', desc: 'Fundamentals & financial statements' },
            { name: 'Alpha Vantage', desc: 'Free tier: 25 req/day' },
            { name: 'Benzinga', desc: 'News & analyst ratings' },
            { name: 'FRED', desc: 'Economic data (free, no key needed)' },
            { name: 'Intrinio', desc: 'Fundamentals & financial data' },
          ].map(p => (
            <Card key={p.name}>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Key size={13} className="text-[var(--brand)]" /> {p.name} <Badge variant="outline" className="text-[9px]">API Key</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">{p.desc}</p>
                <div className="flex gap-2">
                  <Input type="password" placeholder="Enter API key..." className="font-mono text-xs flex-1" />
                  <Button size="sm" variant="outline"><Save size={12} /> Save</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Daily Portfolio Digest', desc: 'Receive daily summary of portfolio performance' },
                { label: 'Risk Alerts', desc: 'Get notified when risk thresholds are breached' },
                { label: 'Signal Alerts', desc: 'Notifications for new buy/sell/hold signals' },
                { label: 'Price Alerts', desc: 'Get notified when watched tickers hit price targets' },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                  <div><p className="text-sm font-medium text-[var(--text-primary)]">{n.label}</p><p className="text-xs text-[var(--text-secondary)]">{n.desc}</p></div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-mono uppercase text-[var(--text-secondary)] tracking-wider">Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Dark Mode</p><p className="text-xs text-[var(--text-secondary)]">Always dark. Light mode is not supported.</p></div><Switch defaultChecked disabled /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Compact Mode</p><p className="text-xs text-[var(--text-secondary)]">Reduce spacing for higher data density</p></div><Switch /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Monospace Numbers</p><p className="text-xs text-[var(--text-secondary)]">Always use Geist Mono for all numeric values</p></div><Switch defaultChecked disabled /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
