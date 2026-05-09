'use client';

import * as React from 'react';
import { api, type Portfolio } from '@/lib/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@openmoney/ui';
import {
  Loader2,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@openmoney/ui';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
export interface PortfolioFormData {
  name: string;
  description: string;
  currency: string;
  isDefault: boolean;
}

interface PortfolioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (portfolio: Portfolio) => void;
  initialData?: Partial<PortfolioFormData>;
  mode?: 'create' | 'edit';
  portfolioId?: string;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
];

/* -------------------------------------------------------------------------- */
/*  Portfolio Form Dialog                                                      */
/* -------------------------------------------------------------------------- */
export function PortfolioFormDialog({
  open,
  onOpenChange,
  onCreated,
  initialData,
  mode = 'create',
  portfolioId,
}: PortfolioFormDialogProps) {
  const [name, setName] = React.useState(initialData?.name ?? '');
  const [description, setDescription] = React.useState(initialData?.description ?? '');
  const [currency, setCurrency] = React.useState(initialData?.currency ?? 'USD');
  const [isDefault, setIsDefault] = React.useState(initialData?.isDefault ?? false);
  const [submitting, setSubmitting] = React.useState(false);

  const isEdit = mode === 'edit';

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '');
      setDescription(initialData?.description ?? '');
      setCurrency(initialData?.currency ?? 'USD');
      setIsDefault(initialData?.isDefault ?? false);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Portfolio name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && portfolioId) {
        const res = await api.portfolios.update(portfolioId, {
          name: trimmedName,
          description: description.trim() || undefined,
          currency,
          isDefault,
        });
        if (!res.success) throw new Error(res.error ?? 'Failed to update portfolio');
        toast.success('Portfolio updated');
        onCreated(res.data);
      } else {
        const res = await api.portfolios.create({
          name: trimmedName,
          description: description.trim() || undefined,
          currency,
          isDefault,
        });
        if (!res.success) throw new Error(res.error ?? 'Failed to create portfolio');
        toast.success('Portfolio created');
        onCreated(res.data);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase size={16} className="text-[var(--accent-brand)]" />
            {isEdit ? 'Edit Portfolio' : 'Create Portfolio'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your portfolio details below.'
              : 'Set up a new portfolio to start tracking positions and risk metrics.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">
              Portfolio Name <span className="text-[var(--negative)]">*</span>
            </Label>
            <Input
              id="portfolio-name"
              placeholder="e.g., Growth Portfolio"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-desc">Description</Label>
            <textarea
              id="portfolio-desc"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent-brand)] transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={submitting}>
              <SelectTrigger id="portfolio-currency" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default switch */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="portfolio-default" className="text-sm font-medium">
                Set as default portfolio
              </Label>
              <p className="text-xs text-[var(--text-secondary)]">
                Default portfolio opens first in dashboards and tools
              </p>
            </div>
            <Switch
              id="portfolio-default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
              disabled={submitting}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {isEdit ? 'Save Changes' : 'Create Portfolio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
