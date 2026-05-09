'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, type Watchlist } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  EmptyState,
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
} from '@openmoney/ui';
import {
  Eye,
  Plus,
  RefreshCw,
  AlertTriangle,
  Star,
  Search,
  Trash2,
} from 'lucide-react';
import { Switch } from '@openmoney/ui';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Watchlist List Page                                                        */
/* -------------------------------------------------------------------------- */
export default function WatchlistListPage() {
  const router = useRouter();

  const [watchlists, setWatchlists] = React.useState<Watchlist[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newIsDefault, setNewIsDefault] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const fetchWatchlists = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.watchlists.list();
      if (!res.success) throw new Error(res.error ?? 'Failed to load watchlists');
      setWatchlists(res.data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      toast.error(err.message ?? 'Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error('Watchlist name is required');
      return;
    }
    setCreating(true);
    try {
      const res = await api.watchlists.create({ name: trimmed, isDefault: newIsDefault });
      if (!res.success) throw new Error(res.error ?? 'Failed to create watchlist');
      toast.success(`Watchlist "${res.data.name}" created`);
      setCreateOpen(false);
      setNewName('');
      setNewIsDefault(false);
      fetchWatchlists();
      router.push(`/watchlist/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create watchlist');
    } finally {
      setCreating(false);
    }
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-1 h-4 w-52" />
          </div>
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
              <div className="pt-2 space-y-2">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle size={24} className="text-[var(--negative)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Failed to load watchlists</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={fetchWatchlists}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---- Empty ---- */
  if (!watchlists.length) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Watchlists</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Monitor tickers and track market movements
          </p>
        </div>
        <EmptyState
          icon={Eye}
          title="No watchlists yet"
          description="Create a watchlist to start tracking tickers, monitor price movements, and receive signals."
          action={{
            label: 'Create Watchlist',
            onClick: () => setCreateOpen(true),
          }}
        />

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye size={16} className="text-[var(--accent-brand)]" />
                Create Watchlist
              </DialogTitle>
              <DialogDescription>
                Give your watchlist a name to get started tracking tickers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="wl-name">
                  Name <span className="text-[var(--negative)]">*</span>
                </Label>
                <Input
                  id="wl-name"
                  placeholder="e.g., Tech Stocks"
                  value={newName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                  disabled={creating}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="wl-default" className="text-sm font-medium">
                    Set as default watchlist
                  </Label>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Default watchlist opens first in watchlist views
                  </p>
                </div>
                <Switch
                  id="wl-default"
                  checked={newIsDefault}
                  onCheckedChange={setNewIsDefault}
                  disabled={creating}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !newName.trim()}>
                  {creating ? 'Creating...' : 'Create Watchlist'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ---- Main ---- */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Watchlists</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {watchlists.length} watchlist{watchlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Create Watchlist
        </button>
      </div>

      {/* Watchlist grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {watchlists.map((wl) => {
          const itemCount = wl.items?.length ?? 0;
          return (
            <button
              key={wl.id}
              onClick={() => router.push(`/watchlist/${wl.id}`)}
              className="group text-left rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent-brand)]/50 hover:shadow-sm hover:shadow-[var(--accent-brand)]/5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye size={16} className="text-[var(--accent-brand)] shrink-0" />
                  <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-brand)] transition-colors truncate">
                    {wl.name}
                  </h3>
                </div>
                {wl.isDefault && (
                  <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                    <Star size={10} className="mr-0.5 inline" />
                    Default
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Search size={12} />
                  {itemCount} ticker{itemCount !== 1 ? 's' : ''}
                </span>
                <span>
                  Created {new Date(wl.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={16} className="text-[var(--accent-brand)]" />
              Create Watchlist
            </DialogTitle>
            <DialogDescription>
              Give your watchlist a name to get started tracking tickers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="wl-name">
                Name <span className="text-[var(--negative)]">*</span>
              </Label>
              <Input
                id="wl-name"
                placeholder="e.g., Tech Stocks"
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                disabled={creating}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="wl-default" className="text-sm font-medium">
                  Set as default watchlist
                </Label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Default watchlist opens first in watchlist views
                </p>
              </div>
              <Switch
                id="wl-default"
                checked={newIsDefault}
                onCheckedChange={setNewIsDefault}
                disabled={creating}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !newName.trim()}>
                {creating ? 'Creating...' : 'Create Watchlist'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

