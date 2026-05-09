'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Badge, Skeleton, EmptyState, Card } from '@openmoney/ui';
import { ArrowLeft, Eye, Edit3, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  type DashboardConfig,
  type WidgetConfig,
  loadDashboards,
  saveDashboard,
  WIDGET_REGISTRY,
} from '../_lib/dashboard-store';
import { WidgetRenderer } from '../_components/widget-renderer';
import { WidgetGallery } from '../_components/widget-gallery';

export default function DashboardViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dashboard, setDashboard] = React.useState<DashboardConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [showGallery, setShowGallery] = React.useState(false);

  React.useEffect(() => {
    const dashboards = loadDashboards();
    const found = dashboards.find((d) => d.id === id);
    if (found) {
      setDashboard(found);
      setEditName(found.name);
    }
    setLoading(false);
  }, [id]);

  const handleSaveLayout = () => {
    if (!dashboard) return;
    const updated = { ...dashboard, name: editName, updatedAt: new Date().toISOString() };
    saveDashboard(updated);
    setDashboard(updated);
    setEditMode(false);
    toast.success('Dashboard saved');
  };

  const handleAddWidget = (widgetType: string) => {
    if (!dashboard) return;
    const meta = WIDGET_REGISTRY.find((w) => w.type === widgetType);
    if (!meta) return;

    const existingIds = dashboard.layout.map((w) => w.id);
    const newId = `${widgetType}-${existingIds.length + 1}-${Date.now()}`;
    const newWidget: WidgetConfig = {
      id: newId,
      type: widgetType as any,
      title: meta.name,
      gridPos: findNextPosition(dashboard.layout, meta.defaultSize.w, meta.defaultSize.h),
      config: {},
    };

    const updated = {
      ...dashboard,
      layout: [...dashboard.layout, newWidget],
      updatedAt: new Date().toISOString(),
    };
    saveDashboard(updated);
    setDashboard(updated);
    setShowGallery(false);
    toast.success(`Added ${meta.name}`);
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!dashboard) return;
    const updated = {
      ...dashboard,
      layout: dashboard.layout.filter((w) => w.id !== widgetId),
      updatedAt: new Date().toISOString(),
    };
    saveDashboard(updated);
    setDashboard(updated);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          title="Dashboard not found"
          description="This dashboard doesn't exist or has been deleted."
          action={{ label: 'Back to Dashboards', onClick: () => router.push('/dashboards') }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboards')} className="rounded-lg p-1.5 hover:bg-[var(--accent)]">
            <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
          </button>
          {editMode ? (
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-64" />
          ) : (
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{dashboard.name}</h1>
              <p className="text-xs text-[var(--text-secondary)]">{dashboard.layout.length} widgets</p>
            </div>
          )}
          {dashboard.isDefault && <Badge className="bg-[var(--accent-brand)]">Default</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button size="sm" onClick={() => setShowGallery(true)}><Plus size={14} /> Add Widget</Button>
              <Button size="sm" onClick={handleSaveLayout}><Save size={14} /> Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setEditName(dashboard.name); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditMode(true)}><Edit3 size={14} /> Edit</Button>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      {dashboard.layout.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EmptyState
            title="Empty dashboard"
            description="Add widgets to build your custom view."
            action={{ label: 'Add Widget', onClick: () => setShowGallery(true) }}
          />
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(100px, auto)',
          }}
        >
            {dashboard.layout.map((widget) => {
            const registry = WIDGET_REGISTRY.find((w) => w.type === widget.type);
            return (
              <div
                key={widget.id}
                className="relative group"
                style={{
                  gridColumn: `span ${Math.min(widget.gridPos.w, 12)}`,
                  gridRow: `span ${widget.gridPos.h}`,
                }}
              >
                <Card className="h-full border-[var(--border)]">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2">
                      {registry?.icon && <span className="text-xs">{registry.icon}</span>}
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{widget.title}</span>
                    </div>
                    {editMode && (
                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="rounded p-0.5 text-[var(--text-secondary)] hover:text-[var(--negative)] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="p-3 h-[calc(100%-36px)]">
                    <WidgetRenderer widget={widget} />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Widget Gallery */}
      <WidgetGallery
        open={showGallery}
        onOpenChange={setShowGallery}
        onAddWidget={handleAddWidget as any}
      />
    </div>
  );
}

function findNextPosition(layout: WidgetConfig[], w: number, h: number) {
  const occupied = new Set(layout.map((l) => `${l.gridPos.x},${l.gridPos.y}`));
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x <= 12 - w; x++) {
      let free = true;
      for (let dy = 0; dy < h && free; dy++) {
        for (let dx = 0; dx < w && free; dx++) {
          if (occupied.has(`${x + dx},${y + dy}`)) free = false;
        }
      }
      if (free) return { x, y, w, h };
    }
  }
  return { x: 0, y: layout.length, w, h };
}
