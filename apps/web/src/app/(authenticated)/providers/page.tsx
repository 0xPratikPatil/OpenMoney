'use client';

import * as React from 'react';
import { api, type ProviderInfo } from '@/lib/api';
import { Skeleton, Card, CardContent, CardHeader, CardTitle, Badge } from '@openmoney/ui';
import { Search, Database, Key, Globe, Package, AlertTriangle, RefreshCw, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['all', 'equity', 'etf', 'forex', 'crypto', 'futures', 'economic', 'news', 'other'] as const;

function providerCategory(models: string[]): string {
  const cats = models.map((m) => m.split('/')[0]!);
  const unique = [...new Set(cats)];
  return unique.length === 1 ? unique[0]! : 'multi';
}

export default function ProvidersPage() {
  const [providers, setProviders] = React.useState<ProviderInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const fetchProviders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.market.providers.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to load providers');
      const list = res.data as unknown as Record<string, {
        description: string;
        models: string[];
        requiresCredentials: boolean;
      }>;
      const result: ProviderInfo[] = Object.entries(list).map(([name, info]) => ({
        name,
        description: info.description ?? '',
        website: '',
        credentials: info.requiresCredentials ? ['api_key'] : [],
        models: info.models ?? [],
        status: 'active',
      }));
      setProviders(result);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load providers');
      toast.error('Failed to load provider registry');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const filtered = React.useMemo(() => {
    let list = providers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.models.some((m) => m.toLowerCase().includes(q)),
      );
    }
    if (category !== 'all') {
      list = list.filter((p) => providerCategory(p.models) === category);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [providers, search, category]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Failed to load provider registry</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchProviders}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Registry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {providers.length} providers &middot; {providers.flatMap((p) => p.models).length} models available
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search providers, models, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((provider) => (
          <Card
            key={provider.name}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setExpanded(expanded === provider.name ? null : provider.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Status indicator */}
                  {provider.status === 'ACTIVE' && (
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                  )}
                  {provider.status === 'ERROR' && (
                    <XCircle size={14} className="text-red-500 shrink-0" />
                  )}
                  {provider.status === 'DISABLED' && (
                    <Key size={14} className="text-amber-500 shrink-0" />
                  )}
                  {provider.status === 'UNKNOWN' && (
                    <HelpCircle size={14} className="text-gray-400 shrink-0" />
                  )}
                  <Package size={16} className="text-primary" />
                  <CardTitle className="text-sm font-mono">{provider.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  {provider.free ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                      Free
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      <Key size={10} className="mr-1" />
                      {provider.status === 'DISABLED' ? 'Needs Key' : 'Paid'}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {provider.models.length} models
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
            </CardHeader>

            {/* Expanded: Model List */}
            {expanded === provider.name && (
              <CardContent className="pt-0 border-t">
                <div className="space-y-1 mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Available Models
                  </p>
                  {provider.models.map((model) => (
                    <div
                      key={model}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-muted-foreground" />
                        <code className="font-mono">{model}</code>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        GET /api/{model.split('/')[0]}/{model.split('/')[1] ?? ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Credential Setup */}
                {provider.credentials.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Authentication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requires {provider.credentials.join(', ')}. Set via{' '}
                      <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                        X-Provider-Key-{provider.name}_api_key
                      </code>{' '}
                      header or{' '}
                      <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                        {provider.name.toUpperCase()}_API_KEY
                      </code>{' '}
                      env variable.
                    </p>
                  </div>
                )}

                {/* Quick curl example */}
                {provider.models.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Quick Test
                    </p>
                    <pre className="rounded-md bg-muted p-3 text-[11px] font-mono overflow-x-auto">
                      <code>
                        curl &quot;http://localhost:4000/api/query&quot; \{'\n'}
                        {'  '}-H &quot;Content-Type: application/json&quot; \{'\n'}
                        {'  '}-d &apos;{JSON.stringify({
                          provider: provider.name,
                          model: provider.models[0],
                          params: {},
                        })}&apos;
                      </code>
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No providers match your search.</p>
        </div>
      )}
    </div>
  );
}
