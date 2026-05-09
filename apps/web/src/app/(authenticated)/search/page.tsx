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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@openmoney/ui';
import {
  Search,
  Eye,
  Plus,
  RefreshCw,
  TrendingUp,
  Globe,
  Loader2,
  ArrowUpRight,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function typeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'stock':
    case 'common stock':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'etf':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'mutual fund':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'index':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    default:
      return 'bg-[var(--muted)] text-[var(--text-secondary)] border-[var(--border)]';
  }
}

/* -------------------------------------------------------------------------- */
/*  Search Page                                                                */
/* -------------------------------------------------------------------------- */
export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /* Add to watchlist state */
  const [watchlists, setWatchlists] = React.useState<Watchlist[]>([]);
  const [watchlistDialogOpen, setWatchlistDialogOpen] = React.useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = React.useState<string>('');
  const [addingToWatchlist, setAddingToWatchlist] = React.useState(false);
  const [pendingTicker, setPendingTicker] = React.useState('');

  const debouncedQuery = useDebounce(query, 300);

  /* Load watchlists for add-to-watchlist feature */
  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.watchlists.list();
        if (res.success && res.data.length > 0) {
          setWatchlists(res.data);
          setSelectedWatchlistId(res.data[0].id);
        }
      } catch {
        /* silently fail */
      }
    })();
  }, []);

  /* Debounced search */
  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const res = await api.search.ticker(debouncedQuery.trim());
        if (!res.success) throw new Error(res.error ?? 'Search failed');
        setResults(res.data);
      } catch (err: any) {
        setError(err.message ?? 'Search failed');
        toast.error(err.message ?? 'Search failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedQuery]);

  const handleViewQuote = (symbol: string) => {
    router.push(`/position/new?ticker=${symbol}`);
  };

  const handleAddToWatchlistClick = (ticker: string) => {
    setPendingTicker(ticker);
    if (watchlists.length === 0) {
      toast.error('No watchlists available. Create one first.');
      return;
    }
    setWatchlistDialogOpen(true);
  };

  const handleConfirmAddToWatchlist = async () => {
    if (!selectedWatchlistId) {
      toast.error('Please select a watchlist');
      return;
    }
    setAddingToWatchlist(true);
    try {
      const res = await api.watchlists.addItem(selectedWatchlistId, pendingTicker);
      if (!res.success) throw new Error(res.error ?? 'Failed to add ticker');
      toast.success(`${pendingTicker} added to watchlist`);
      setWatchlistDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add ticker');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    /* auto-focus search input on mount */
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Search</h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Find stocks, ETFs, mutual funds, and indices
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for stocks, ETFs, or mutual funds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] pl-12 pr-12 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent-brand)] focus:ring-1 focus:ring-[var(--accent-brand)] transition-all"
          />
          {loading && (
            <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent-brand)] animate-spin" />
          )}
          {!loading && query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--text-secondary)] text-center">
          Search across {watchlists.length > 0 ? `${watchlists.length} watchlist${watchlists.length > 1 ? 's' : ''} and` : ''} global market data
        </p>
      </div>

      {/* Loading results */}
      {loading && (
        <div className="max-w-4xl mx-auto space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
            <p className="text-sm text-[var(--negative)]">{error}</p>
            <button
              onClick={() => setQuery(debouncedQuery)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-brand)] hover:underline"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* No query yet */}
      {!hasSearched && !loading && (
        <EmptyState
          icon={Search}
          title="Search for stocks, ETFs, or mutual funds"
          description="Type a ticker symbol or company name above to get started."
        />
      )}

      {/* No results */}
      {hasSearched && !loading && !error && results.length === 0 && query.trim() && (
        <EmptyState
          icon={Search}
          title={`No results found for "${query}"`}
          description="Try a different ticker symbol or company name. Check your spelling or search for related terms."
        />
      )}

      {/* Results table */}
      {hasSearched && !loading && !error && results.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--accent-brand)]" />
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px]">Exchange</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[220px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.symbol}>
                    {/* Symbol */}
                    <TableCell>
                      <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {r.symbol}
                      </span>
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <span className="text-sm text-[var(--text-primary)]">{r.name}</span>
                    </TableCell>

                    {/* Exchange */}
                    <TableCell>
                      <span className="text-xs text-[var(--text-secondary)]">{r.exchange || '--'}</span>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${typeColor(r.type)}`}>
                        {r.type === 'Common Stock' ? 'Stock' : r.type}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleViewQuote(r.symbol)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)] transition-colors"
                              >
                                <ArrowUpRight size={12} />
                                Quote
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>View quote and details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleAddToWatchlistClick(r.symbol)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-brand)] hover:border-[var(--accent-brand)]/50 hover:bg-[var(--accent)] transition-colors"
                              >
                                <Eye size={12} />
                                Watchlist
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Add to watchlist</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add to watchlist dialog */}
      <Dialog open={watchlistDialogOpen} onOpenChange={setWatchlistDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={16} className="text-[var(--accent-brand)]" />
              Add to Watchlist
            </DialogTitle>
            <DialogDescription>
              Choose a watchlist to add {pendingTicker} to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={selectedWatchlistId} onValueChange={setSelectedWatchlistId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select watchlist" />
              </SelectTrigger>
              <SelectContent>
                {watchlists.map((wl) => (
                  <SelectItem key={wl.id} value={wl.id}>
                    {wl.name} {wl.isDefault ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setWatchlistDialogOpen(false)} disabled={addingToWatchlist}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddToWatchlist} disabled={addingToWatchlist || !selectedWatchlistId}>
              {addingToWatchlist ? 'Adding...' : `Add ${pendingTicker}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

