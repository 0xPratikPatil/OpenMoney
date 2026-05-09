'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
} from '@openmoney/ui';
import {
  LayoutDashboard,
  Plus,
  Settings,
  Copy,
  Trash2,
  Edit3,
  Star,
  LayoutTemplate,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  loadDashboards,
  deleteDashboard,
  setDefaultDashboard,
  duplicateDashboard,
  createDashboard,
  TEMPLATES,
  type DashboardConfig,
} from './_lib/dashboard-store';

/* -------------------------------------------------------------------------- */
/*  Confirm Dialog                                                             */
/* -------------------------------------------------------------------------- */

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  dashboardName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  dashboardName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--negative)]" />
            Delete Dashboard
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>&ldquo;{dashboardName}&rdquo;</strong>? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Create/Edit Dialog                                                          */
/* -------------------------------------------------------------------------- */

function CreateDashboardDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (dash: DashboardConfig) => void;
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  function handleCreate() {
    if (!name.trim()) return;
    const dash = createDashboard(name.trim(), description.trim() || undefined);
    onCreated(dash);
    setName('');
    setDescription('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Dashboard</DialogTitle>
          <DialogDescription>
            Create a blank dashboard to arrange your own widgets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Dashboard"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Description <span className="text-[var(--text-secondary)]/60">(optional)</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this dashboard for?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Card                                                             */
/* -------------------------------------------------------------------------- */

function DashboardCard({
  dashboard,
  onDelete,
  onDuplicate,
  onSetDefault,
  onNavigate,
}: {
  dashboard: DashboardConfig;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const widgetCount = dashboard.layout.length;
  const timeAgo = getTimeAgo(dashboard.updatedAt);

  return (
    <button
      type="button"
      onClick={() => onNavigate(dashboard.id)}
      className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 text-left transition-all hover:border-[var(--accent-brand)] hover:shadow-sm"
    >
      {/* Default badge */}
      {dashboard.isDefault && (
        <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] gap-1">
          <Star size={10} className="fill-current" />
          Default
        </Badge>
      )}

      {/* Menu trigger */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        {!dashboard.isDefault && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--accent)] hover:text-[var(--text-primary)] transition-all"
          >
            <Settings size={14} />
          </button>
        )}

        {showMenu && (
          <div className="absolute right-0 top-8 z-50 w-44 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-1 shadow-lg">
            {[
              {
                label: 'Edit',
                icon: <Edit3 size={12} />,
                onClick: () => onNavigate(dashboard.id),
              },
              {
                label: 'Duplicate',
                icon: <Copy size={12} />,
                onClick: () => onDuplicate(dashboard.id),
              },
              {
                label: 'Set as Default',
                icon: <Star size={12} />,
                onClick: () => onSetDefault(dashboard.id),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={12} />,
                onClick: () => onDelete(dashboard.id),
                danger: true,
              },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  action.onClick();
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                  action.danger
                    ? 'text-[var(--negative)] hover:bg-[var(--negative)]/10'
                    : 'text-[var(--text-primary)] hover:bg-[var(--accent)]'
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-brand)]">
        <LayoutDashboard size={18} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{dashboard.name}</h3>
      {dashboard.description && (
        <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2">{dashboard.description}</p>
      )}
      <div className="mt-auto pt-4 flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
        <span>{widgetCount} widget{widgetCount !== 1 ? 's' : ''}</span>
        <span>{timeAgo}</span>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Template card                                                               */
/* -------------------------------------------------------------------------- */

function TemplateCard({
  template,
  onUse,
}: {
  template: (typeof TEMPLATES)[number];
  onUse: (templateId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onUse(template.id)}
      className="flex flex-col items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 text-left transition-all hover:border-[var(--accent-brand)] hover:shadow-sm"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]">
        <LayoutTemplate size={18} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{template.name}</h3>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{template.description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-[var(--accent-brand)]">
        Use Template <ArrowRight size={12} />
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardsPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = React.useState<DashboardConfig[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showNewMenu, setShowNewMenu] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DashboardConfig | null>(null);
  const newMenuRef = React.useRef<HTMLDivElement>(null);

  // Load dashboards
  React.useEffect(() => {
    setDashboards(loadDashboards());
    setLoaded(true);
  }, []);

  // Close new menu on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
    }
    if (showNewMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNewMenu]);

  function refresh() {
    setDashboards(loadDashboards());
  }

  function handleDelete(id: string) {
    deleteDashboard(id);
    refresh();
  }

  function handleDuplicate(id: string) {
    duplicateDashboard(id);
    refresh();
  }

  function handleSetDefault(id: string) {
    setDefaultDashboard(id);
    refresh();
  }

  function handleUseTemplate(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const dash = createDashboard(template.name, template.description, template.layout);
    router.push(`/dashboards/${dash.id}`);
  }

  function handleCreated(dash: DashboardConfig) {
    router.push(`/dashboards/${dash.id}`);
  }

  const userDashboards = dashboards;
  const hasDashboards = userDashboards.length > 0;

  if (!loaded) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Dashboards</h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Create and manage custom layouts for your market data and analytics.
          </p>
        </div>
        <div className="relative" ref={newMenuRef}>
          <Button onClick={() => setShowNewMenu(!showNewMenu)}>
            <Plus size={14} />
            New Dashboard
          </Button>

          {showNewMenu && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setShowNewMenu(false);
                  setShowCreate(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)]"
              >
                <Plus size={14} />
                Blank Dashboard
              </button>
              <div className="border-t border-[var(--border)] my-1" />
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    handleUseTemplate(t.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--accent)]"
                >
                  <LayoutTemplate size={14} />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Templates section ===== */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          <LayoutTemplate size={14} />
          Pre-built Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      </section>

      {/* ===== User dashboards ===== */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Your Dashboards
        </h2>

        {hasDashboards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDashboards.map((dash) => (
              <DashboardCard
                key={dash.id}
                dashboard={dash}
                onDelete={(id) => setDeleteTarget(dashboards.find((d) => d.id === id) ?? null)}
                onDuplicate={handleDuplicate}
                onSetDefault={handleSetDefault}
                onNavigate={(id) => router.push(`/dashboards/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)]">
            <EmptyState
              icon={LayoutDashboard}
              title="Create your first custom dashboard"
              description="Build a custom layout with the widgets that matter most to you, or start from a pre-built template."
              action={{
                label: 'Create Dashboard',
                onClick: () => setShowCreate(true),
              }}
              secondaryAction={{
                label: 'Use a Template',
                onClick: () => document.querySelector('[data-template-section]')?.scrollIntoView({ behavior: 'smooth' }),
              }}
            />
          </div>
        )}
      </section>

      {/* ===== Create dialog ===== */}
      <CreateDashboardDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />

      {/* ===== Delete confirm dialog ===== */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        dashboardName={deleteTarget?.name ?? ''}
      />
    </div>
  );
}

