'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  EmptyState,
  Callout,
} from '@openmoney/ui';
import {
  Key,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Provider {
  name: string;
  description: string;
  status: string;
  // Extended info (mock for MVP)
  apiKeyRequired: boolean;
  apiKeyConfigured: boolean;
  supportedModels: string[];
  priority: number;
}

/* -------------------------------------------------------------------------- */
/*  Mock provider data for MVP                                                  */
/* -------------------------------------------------------------------------- */

const MOCK_PROVIDERS: Provider[] = [
  {
    name: 'Yahoo Finance',
    description: 'Free market data for equities, ETFs, forex, and cryptocurrencies. No API key required.',
    status: 'active',
    apiKeyRequired: false,
    apiKeyConfigured: false,
    supportedModels: ['Equity Historical', 'Equity Quote', 'Forex Pairs', 'Crypto Pairs'],
    priority: 1,
  },
  {
    name: 'Financial Modeling Prep',
    description: 'Comprehensive financial statements, SEC filings, and market data for US equities.',
    status: 'active',
    apiKeyRequired: true,
    apiKeyConfigured: false,
    supportedModels: ['Equity Historical', 'Equity Quote', 'Financial Statements', 'SEC Filings', 'ETF Holdings'],
    priority: 2,
  },
  {
    name: 'Polygon.io',
    description: 'Real-time and historical market data for stocks, options, forex, and crypto with WebSocket streaming.',
    status: 'active',
    apiKeyRequired: true,
    apiKeyConfigured: false,
    supportedModels: ['Equity Historical', 'Equity Quote', 'Options Chains', 'Forex Pairs', 'Real-time Trades'],
    priority: 3,
  },
  {
    name: 'Alpha Vantage',
    description: 'Free APIs for real-time and historical stock data, forex, crypto, and technical indicators.',
    status: 'active',
    apiKeyRequired: true,
    apiKeyConfigured: false,
    supportedModels: ['Equity Quote', 'Technical Indicators', 'Forex Pairs', 'Crypto Pairs'],
    priority: 4,
  },
  {
    name: 'FRED (Federal Reserve)',
    description: 'Economic data from the Federal Reserve Bank of St. Louis — GDP, inflation, unemployment, and more.',
    status: 'active',
    apiKeyRequired: true,
    apiKeyConfigured: false,
    supportedModels: ['Economic Indicators', 'Interest Rates', 'Inflation Data'],
    priority: 5,
  },
];

/* -------------------------------------------------------------------------- */
/*  API Key Dialog                                                              */
/* -------------------------------------------------------------------------- */

function ApiKeyDialog({
  provider,
  open,
  onOpenChange,
  onSaved,
}: {
  provider: Provider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [apiKey, setApiKey] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await api.providers.setCredential(provider.name.toLowerCase().replace(/\s+/g, '-'), apiKey.trim());
      if (!res.success) throw new Error(res.error ?? 'Failed to save API key');
      toast.success(`${provider.name} API key configured`);
      onSaved();
      onOpenChange(false);
      setApiKey('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
          <DialogDescription>
            Enter your API key for {provider.name}. Your key is stored encrypted and used only
            for market data requests.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label
            htmlFor="provider-api-key"
            className="block text-xs font-medium text-[var(--text-primary)]"
          >
            API Key
          </label>
          <Input
            id="provider-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) setError('');
            }}
            placeholder="sk_..."
            className="font-mono"
          />
          {error && (
            <p className="text-xs text-[var(--negative)]">{error}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider Card                                                              */
/* -------------------------------------------------------------------------- */

function ProviderCard({
  provider,
  onConfigured,
}: {
  provider: Provider;
  onConfigured: () => void;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [modelsOpen, setModelsOpen] = React.useState(false);

  const isConfigured = !provider.apiKeyRequired || provider.apiKeyConfigured;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: provider info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {provider.name}
                </h3>
                {isConfigured ? (
                  <Badge variant="outline" className="text-[var(--positive)] border-[var(--positive)]/30 bg-[var(--positive)]/5">
                    <CheckCircle size={10} className="mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5">
                    <XCircle size={10} className="mr-1" />
                    Needs key
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                {provider.description}
              </p>

              {/* API key status */}
              {provider.apiKeyRequired && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <Key size={12} className="text-[var(--text-secondary)]" />
                  {provider.apiKeyConfigured ? (
                    <span className="text-[var(--positive)]">API key configured</span>
                  ) : (
                    <span className="text-[var(--warning)]">API key missing</span>
                  )}
                </div>
              )}

              {/* Priority */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <GripVertical size={12} />
                Priority: {provider.priority}
              </div>

              {/* Supported models (collapsible) */}
              <Collapsible open={modelsOpen} onOpenChange={setModelsOpen} className="mt-3">
                <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  {modelsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  Supported models ({provider.supportedModels.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <ul className="space-y-1">
                    {provider.supportedModels.map((model) => (
                      <li
                        key={model}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pl-4"
                      >
                        <span className="h-1 w-1 rounded-full bg-[var(--accent-brand)]" />
                        {model}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Right: action */}
            <div className="shrink-0">
              {provider.apiKeyRequired && !provider.apiKeyConfigured ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <Key size={12} className="mr-1.5" />
                  Configure
                </Button>
              ) : (
                <Badge className="bg-[var(--positive)]/10 text-[var(--positive)] border border-[var(--positive)]/20">
                  <Shield size={12} className="mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ApiKeyDialog
        provider={provider}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={onConfigured}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DataProvidersSettingsPage() {
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProviders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.providers.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to load providers');
      // Merge with mock data for extended fields
      const merged: Provider[] = res.data.map((p: { name: string; description: string; status: string }, i: number) => {
        const mockRef: Provider | undefined = MOCK_PROVIDERS[i];
        const mock: Provider = mockRef ?? MOCK_PROVIDERS[0]!;
        return {
          name: p.name,
          description: p.description,
          status: p.status,
          apiKeyRequired: mock.apiKeyRequired,
          apiKeyConfigured: mock.apiKeyConfigured,
          supportedModels: mock.supportedModels,
          priority: mock.priority,
        };
      });
      setProviders(merged);
    } catch (err: any) {
      // Fall back to mock providers if API fails
      setProviders(MOCK_PROVIDERS);
      setError(err.message ?? 'Could not load from server, showing defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  /* ======== Loading ======== */

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-3"
          >
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  /* ======== Error (no providers) ======== */

  if (error && !providers.length) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Callout variant="error" title="Failed to load providers">
          <p className="mb-3">{error}</p>
          <Button onClick={fetchProviders}>
            <RefreshCw size={14} className="mr-1.5" />
            Retry
          </Button>
        </Callout>
      </div>
    );
  }

  /* ======== Empty ======== */

  if (!providers.length) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState.Providers
          action={{
            label: 'Refresh',
            onClick: fetchProviders,
          }}
        />
      </div>
    );
  }

  /* ======== Data ======== */

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Data Providers</h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Configure and manage your market data sources. Providers are queried in priority order for
          each data type.
        </p>
      </div>

      {/* Optional warning banner */}
      {error && (
        <Callout variant="warn" title="Using default configuration">
          <p className="text-sm">{error}</p>
        </Callout>
      )}

      {/* Provider cards */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.name}
            provider={provider}
            onConfigured={fetchProviders}
          />
        ))}
      </div>
    </div>
  );
}

