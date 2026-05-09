'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { Card, CardContent, Input, Button, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Select } from '@openmoney/ui';
import { Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function ScreenerPage() {
  const [filters, setFilters] = React.useState({
    marketCapMin: '',
    priceMin: '',
    priceMax: '',
    sector: '',
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Stock Screener</h1>
        <p className="text-sm text-[var(--text-secondary)]">Screen equities by fundamental and technical criteria</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-mono text-[var(--text-secondary)]">Min Market Cap</label>
              <Input placeholder="e.g. 1B" value={filters.marketCapMin} onChange={(e) => setFilters({...filters, marketCapMin: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-mono text-[var(--text-secondary)]">Min Price</label>
              <Input placeholder="e.g. 10" value={filters.priceMin} onChange={(e) => setFilters({...filters, priceMin: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-mono text-[var(--text-secondary)]">Max Price</label>
              <Input placeholder="e.g. 500" value={filters.priceMax} onChange={(e) => setFilters({...filters, priceMax: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-mono text-[var(--text-secondary)]">Sector</label>
              <select className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-sm px-3 text-[var(--text-primary)]">
                <option value="">All Sectors</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="financial">Financial</option>
                <option value="energy">Energy</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button size="sm"><Filter size={14} /> Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder results */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">P/E</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[var(--text-secondary)]">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  Apply filters to see results
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

