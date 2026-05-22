'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { api } from '@/lib/api';
import {
  Card, CardContent, Button, Badge,
  Skeleton, Collapsible, CollapsibleTrigger, CollapsibleContent,
  Callout,
} from '@openmoney/ui';
import {
  Key, Shield, CheckCircle, RefreshCw,
  ChevronDown, ChevronRight, Database, Package, Globe,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ProviderInfo {
  name: string;
  description: string;
  website: string;
  credentials: string[];
  models: string[];
}

/* -------------------------------------------------------------------------- */
/*  Provider Card                                                              */
/* -------------------------------------------------------------------------- */

function ProviderCard({ provider }: { provider: ProviderInfo }) {
  const [modelsOpen, setModelsOpen] = React.useState(false);
  const requiresKey = provider.credentials.length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Package size={16} className="text-[var(--accent-brand)]" />
              <h3 className="text-sm font-semibold font-mono text-[var(--text-primary)]">
                {provider.name}
              </h3>
              {requiresKey ? (
                <Badge variant="outline" className="text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5">
                  <Key size={10} className="mr-1" /> API Key
                </Badge>
              ) : (
                <Badge className="bg-[var(--positive)]/10 text-[var(--positive)] border-[var(--positive)]/20">
                  <Shield size={12} className="mr-1" /> Free
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] font-mono ml-auto">
                {provider.models.length} models
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              {provider.description}
            </p>

            {/* Credential info */}
            {requiresKey && (
              <div className="mt-2">
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Requires: {provider.credentials.join(', ')}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                  Set via{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">
                    {provider.name.toUpperCase()}_API_KEY
                  </code>{' '}
                  env variable or{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">
                    X-Provider-Key-{provider.name}
                  </code>{' '}
                  header
                </p>
              </div>
            )}

            {/* Models collapsible */}
            <Collapsible open={modelsOpen} onOpenChange={setModelsOpen} className="mt-3">
              <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                {modelsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Models ({provider.models.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 max-h-60 overflow-y-auto">
                <ul className="space-y-0.5">
                  {provider.models.map((model) => (
                    <li key={model} className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] pl-4">
                      <Database size={10} className="shrink-0 text-[var(--accent-brand)]" />
                      <code className="font-mono">{model}</code>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DataProvidersSettingsPage() {
  const [providers, setProviders] = React.useState<ProviderInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProviders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.market.providers.list();
      if (!res.success) throw new Error(res.error?.message ?? 'Failed to load providers');
      const data = res.data as unknown as Record<string, {
        description: string; models: string[]; requiresCredentials: boolean; website?: string;
      }>;
      const list: ProviderInfo[] = Object.entries(data).map(([name, info]) => ({
        name,
        description: info.description ?? '',
        website: info.website ?? '',
        credentials: info.requiresCredentials ? ['api_key'] : [],
        models: info.models ?? [],
      }));
      setProviders(list.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      setError(err.message ?? 'Could not load provider registry');
      toast.error('Failed to load provider registry');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const totalModels = providers.reduce((sum, p) => sum + p.models.length, 0);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  /* ---- Error ---- */
  if (error && !providers.length) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border p-12 text-center">
          <AlertTriangle size={32} className="mb-3 text-red-500" />
          <h2 className="text-lg font-semibold">Provider Registry Unavailable</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <Button onClick={fetchProviders} className="mt-4">
            <RefreshCw size={14} className="mr-1.5" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Data Providers</h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          {providers.length} providers registered — {totalModels} total models available across all providers.
          Providers without API keys are queried whenever a matching model is requested.
        </p>
      </div>

      <Callout variant="info" title="Multi-Provider Architecture">
        <p className="text-xs">
          Each provider registers fetcher models. The <code className="bg-muted px-1 rounded text-[10px]">provider</code> query
          parameter selects which one to use. Set a default per data type in your preferences.
          Free providers (like Yahoo Finance) work immediately — others need API keys.
        </p>
      </Callout>

      <div className="space-y-4">
        {providers.map((provider) => (
          <ProviderCard key={provider.name} provider={provider} />
        ))}
      </div>
    </div>
  );
}
