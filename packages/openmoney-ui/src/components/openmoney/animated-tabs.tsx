'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   AnimatedTabs — tab bar with a sliding underline/highlight indicator.

   A fully accessible tab component where the active tab indicator slides
   smoothly between triggers using motion/react's layoutId. The indicator
   is a motion.div with layoutId="tab-indicator" — Framer Motion handles
   the positional interpolation automatically.

   Styled per DESIGN.md: dark surface-1 background, border, 0.2rem radius.
   Animations: 200ms ease-out on the indicator slide (in DESIGN.md range).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Context ───────────────────────────────────────────────────────────── */

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabsId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('AnimatedTabs compound components must be used within <AnimatedTabs>');
  }
  return ctx;
}

let tabIdCounter = 0;
function generateId(): string {
  return `animated-tabs-${++tabIdCounter}`;
}

/* ── AnimatedTabs ──────────────────────────────────────────────────────── */

export interface AnimatedTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The value of the initially active tab */
  defaultValue: string;
  /** Called when the active tab changes */
  onValueChange?: (value: string) => void;
  /** Content — AnimatedTabsList + AnimatedTabsContent(s) */
  children: ReactNode;
  className?: string;
}

/**
 * Root container for the animated tabs system.
 *
 * Manages active-tab state via React context and provides an accessible
 * ARIA `tablist`/`tabpanel` structure.
 *
 * @example
 * ```tsx
 * <AnimatedTabs defaultValue="overview">
 *   <AnimatedTabsList>
 *     <AnimatedTabsTrigger value="overview">Overview</AnimatedTabsTrigger>
 *     <AnimatedTabsTrigger value="details">Details</AnimatedTabsTrigger>
 *   </AnimatedTabsList>
 *   <AnimatedTabsContent value="overview">
 *     <OverviewPanel />
 *   </AnimatedTabsContent>
 *   <AnimatedTabsContent value="details">
 *     <DetailsPanel />
 *   </AnimatedTabsContent>
 * </AnimatedTabs>
 * ```
 */
export function AnimatedTabs({
  defaultValue,
  onValueChange,
  children,
  className,
  ...props
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const [tabsId] = useState(generateId);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      onValueChange?.(value);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, tabsId }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

AnimatedTabs.displayName = 'AnimatedTabs';

/* ── AnimatedTabsList ──────────────────────────────────────────────────── */

export interface AnimatedTabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * The horizontal tab bar containing AnimatedTabsTrigger elements.
 *
 * Renders as a surface-1 background with border, slim padding,
 * and a relative position anchor for the sliding indicator.
 */
export function AnimatedTabsList({
  children,
  className,
  ...props
}: AnimatedTabsListProps) {
  const { tabsId } = useTabsContext();

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      id={`${tabsId}-list`}
      className={cn(
        'relative flex w-fit gap-0.5 rounded-md border p-1',
        'bg-surface-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

AnimatedTabsList.displayName = 'AnimatedTabsList';

/* ── AnimatedTabsTrigger ───────────────────────────────────────────────── */

export interface AnimatedTabsTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Value that maps to the matching AnimatedTabsContent */
  value: string;
  /** Tab label (string or JSX) */
  children: ReactNode;
  /** Disable this tab */
  disabled?: boolean;
  className?: string;
}

/**
 * A single tab trigger button.
 *
 * When active, a sliding highlight bar appears behind the text.
 * The highlight is positioned via a sibling motion.div with
 * `layoutId="tab-indicator"`, so Framer Motion interpolates its
 * position automatically as the active tab changes.
 *
 * Accessibility: Keyboard navigation follows the ARIA tabs pattern
 * (ArrowLeft/ArrowRight move between tabs, Home/End jump to ends).
 */
export function AnimatedTabsTrigger({
  value,
  children,
  disabled = false,
  className,
  ...props
}: AnimatedTabsTriggerProps) {
  const { activeTab, setActiveTab, tabsId } = useTabsContext();
  const isActive = activeTab === value;
  const panelId = `${tabsId}-panel-${value}`;
  const triggerId = `${tabsId}-trigger-${value}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const triggers = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    const idx = triggers.indexOf(e.currentTarget);

    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % triggers.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + triggers.length) % triggers.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = triggers.length - 1;

    if (nextIdx >= 0) {
      e.preventDefault();
      triggers[nextIdx]?.focus();
    }
  };

  return (
    <button
      role="tab"
      id={triggerId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => !disabled && setActiveTab(value)}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative z-10 rounded-sm px-3 py-1.5',
        'text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        isActive
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 rounded-sm bg-surface-2"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

AnimatedTabsTrigger.displayName = 'AnimatedTabsTrigger';

/* ── AnimatedTabsContent ───────────────────────────────────────────────── */

export interface AnimatedTabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Value matching the active tab */
  value: string;
  children: ReactNode;
  className?: string;
}

/**
 * Content panel associated with a tab trigger.
 *
 * Only renders its children when its `value` matches the active tab.
 * Uses a subtle fade + slide-up animation (200ms ease-out) on mount.
 */
export function AnimatedTabsContent({
  value,
  children,
  className,
  ...props
}: AnimatedTabsContentProps) {
  const { activeTab, tabsId } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${value}`}
      aria-labelledby={`${tabsId}-trigger-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        'ring-offset-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

AnimatedTabsContent.displayName = 'AnimatedTabsContent';
