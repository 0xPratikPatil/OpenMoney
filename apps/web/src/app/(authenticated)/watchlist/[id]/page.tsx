'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Watchlist } from '@/lib/api';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Input, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Skeleton, EmptyState, Callout, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@openmoney/ui';
import {
  ArrowLeft, Search, Plus, X, Star, TrendingUp, TrendingDown, Trash2,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WatchlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [watchlist, setWatchlist] = React.useState<Watchlist | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [newTicker, setNewTicker] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const fetchWatchlist = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.watchlists.get(id);
      setWatchlist(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  const addTicker = async () => {
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker) return;
    setAdding(true);
    try {
      await api.watchlists.addItem(id, ticker);
      toast.success(`Added ${ticker}`);
      setNewTicker('');
      fetchWatchlist();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add ticker');
    } finally {
      setAdding(false);
    }
  };

  const removeTicker = async (itemId: string, ticker: string) => {
    try {
      await api.watchlists.removeItem(id, itemId);
      toast.success(`Removed ${ticker}`);
      fetchWatchlist();
    } catch {
      toast.error('Failed to remove ticker');
    }
  };

  const deleteWatchlist = async () => {
    setDeleting(true);
    try {
      await api.watchlists.delete(id);
      toast.success('Watchlist deleted');
      router.push('/watchlist');
    } catch {
      toast.error('Failed to delete watchlist');
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) return <WatchlistDetailSkeleton />;
  if (error) return (
    <div className="p-6 max-w-4xl mx-auto">
      <Callout variant="error" title="Failed to load">
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchWatchlist}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-brand)] hover:underline"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </Callout>
    </div>
  );
  if (!watchlist) return null;

  const priceCache: Record<string, { price?: number; change?: number }> = {};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/watchlist')} className="rounded-lg p-1.5 hover:bg-[var(--accent)]">
            <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{watchlist.name}</h1>
            <p className="text-xs text-[var(--text-secondary)]">{watchlist.items.length} tickers</p>
          </div>
          {watchlist.isDefault && <Badge className="bg-[var(--accent-brand)]"><Star size={10} /> Default</Badge>}
        </div>
        <Button variant="outline" size="sm" className="text-[var(--negative)]" onClick={() => setShowDelete(true)}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      {/* Add ticker */}
      <div className="flex gap-2">
        <Input
          placeholder="Search ticker symbol..."
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTicker()}
          className="flex-1"
        />
        <Button onClick={addTicker} disabled={!newTicker.trim() || adding}>
          <Plus size={14} /> {adding ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {/* Ticker table */}
      <Card>
        <CardContent className="p-0">
          {watchlist.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={32} className="text-[var(--text-secondary)] mb-3" />
              <p className="font-medium text-[var(--text-primary)]">No tickers yet</p>
              <p className="text-sm text-[var(--text-secondary)]">Add tickers above to start monitoring</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.items.map((item) => {
                  const quote = priceCache[item.ticker];
                  return (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-[var(--accent)]">
                      <TableCell className="font-mono font-bold text-[var(--text-primary)]">{item.ticker}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{item.note || item.ticker}</TableCell>
                      <TableCell className="text-right font-mono">--</TableCell>
                      <TableCell className="text-right font-mono text-[var(--text-secondary)]">--</TableCell>
                      <TableCell className="text-right font-mono text-[var(--text-secondary)]">--</TableCell>
                      <TableCell>
                        <button onClick={() => removeTicker(item.id, item.ticker)}
                          className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--negative)] hover:bg-[var(--negative)]/10"
                        >
                          <X size={14} />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Watchlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{watchlist.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteWatchlist} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WatchlistDetailSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
