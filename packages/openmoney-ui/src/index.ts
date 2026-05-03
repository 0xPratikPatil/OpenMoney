// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
export { colors } from './tokens';
export type { ColorKey } from './tokens';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
export { cn } from './lib/utils';

// ---------------------------------------------------------------------------
// UI Primitives (shadcn)
// ---------------------------------------------------------------------------
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/accordion';
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from './components/ui/alert-dialog';
export { AspectRatio } from './components/ui/aspect-ratio';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbEllipsis } from './components/ui/breadcrumb';
export { Button, buttonVariants } from './components/ui/button';
export { ButtonGroup } from './components/ui/button-group';
export { Calendar } from './components/ui/calendar';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './components/ui/carousel';
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from './components/ui/chart';
export { Checkbox } from './components/ui/checkbox';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/ui/collapsible';
export { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxEmpty, ComboboxSeparator, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxTrigger, ComboboxValue } from './components/ui/combobox';
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from './components/ui/command';
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from './components/ui/context-menu';
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/ui/dialog';
export { DirectionProvider, useDirection } from './components/ui/direction';
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from './components/ui/drawer';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup } from './components/ui/dropdown-menu';
export { Empty } from './components/ui/empty';
export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from './components/ui/field';
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from './components/ui/form';
export { HoverCard, HoverCardTrigger, HoverCardContent } from './components/ui/hover-card';
export { Input } from './components/ui/input';
export { InputGroup } from './components/ui/input-group';
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './components/ui/input-otp';
export { Kbd } from './components/ui/kbd';
export { Label } from './components/ui/label';
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarShortcut } from './components/ui/menubar';
export { NativeSelect } from './components/ui/native-select';
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport } from './components/ui/navigation-menu';
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from './components/ui/pagination';
export { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
export { Progress } from './components/ui/progress';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export { ResizablePanel, ResizableHandle, ResizablePanelGroup } from './components/ui/resizable';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/ui/sheet';
export { Skeleton } from './components/ui/skeleton';
export { Slider } from './components/ui/slider';
export { Toaster as SonnerToaster } from './components/ui/sonner';
export { Spinner } from './components/ui/spinner';
export { Switch } from './components/ui/switch';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/ui/table';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from './components/ui/toast';
export { Toaster } from './components/ui/toaster';
export { Toggle, toggleVariants } from './components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';

// ---------------------------------------------------------------------------
// Domain Components (OpenMoney-specific)
// ---------------------------------------------------------------------------
export { AllocationPie } from './components/openmoney/allocation-pie';
export type { AllocationPieProps, AllocationSegment } from './components/openmoney/allocation-pie';
export { Callout } from './components/openmoney/callout';
export type { CalloutProps } from './components/openmoney/callout';
export { ComparisonOverlay } from './components/openmoney/comparison-overlay';
export type { ComparisonOverlayProps } from './components/openmoney/comparison-overlay';
export { CorrelationMatrix } from './components/openmoney/correlation-matrix';
export type { CorrelationMatrixProps } from './components/openmoney/correlation-matrix';
export { DataFreshnessIndicator } from './components/openmoney/data-freshness-indicator';
export type { DataFreshnessIndicatorProps, FreshnessState } from './components/openmoney/data-freshness-indicator';
export { DateRangePicker } from './components/openmoney/date-range-picker';
export type { DateRangePickerProps, DateRange } from './components/openmoney/date-range-picker';
export { EmptyState } from './components/openmoney/empty-state';
export type { EmptyStateProps } from './components/openmoney/empty-state';
export { FilterBar } from './components/openmoney/filter-bar';
export type { FilterBarProps } from './components/openmoney/filter-bar';
export { JournalCard } from './components/openmoney/journal-card';
export type { JournalCardProps } from './components/openmoney/journal-card';
export { JournalForm } from './components/openmoney/journal-form';
export type { JournalFormProps, JournalFormData } from './components/openmoney/journal-form';
export { AppShell } from './components/openmoney/layout';
export type { AppShellProps } from './components/openmoney/layout';
export { MetricBlock } from './components/openmoney/metric-block';
export type { MetricBlockProps } from './components/openmoney/metric-block';
export { MetricsGrid } from './components/openmoney/metrics-grid';
export type { MetricsGridProps } from './components/openmoney/metrics-grid';
export { PositionTable } from './components/openmoney/position-table';
export type { PositionTableProps, Position } from './components/openmoney/position-table';
export { PriceChart } from './components/openmoney/price-chart';
export type { PriceChartProps } from './components/openmoney/price-chart';
export { RiskGauge } from './components/openmoney/risk-gauge';
export type { RiskGaugeProps, RiskSegment } from './components/openmoney/risk-gauge';
export { Sidebar } from './components/openmoney/sidebar';
export type { SidebarProps, SidebarItem, SidebarSection } from './components/openmoney/sidebar';
export { SignalCard } from './components/openmoney/signal-card';
export type { SignalCardProps } from './components/openmoney/signal-card';
export { SignalTimeline } from './components/openmoney/signal-timeline';
export type { SignalTimelineProps } from './components/openmoney/signal-timeline';
export { SlideInPanel } from './components/openmoney/slide-in-panel';
// SlideInPanel type embedded from './components/openmoney/slide-in-panel';
export { Sparkline } from './components/openmoney/sparkline';
export type { SparklineProps } from './components/openmoney/sparkline';
export { TickerSearch } from './components/openmoney/ticker-search';
export type { TickerSearchProps } from './components/openmoney/ticker-search';
export { TopBar } from './components/openmoney/topbar';
export type { TopBarProps } from './components/openmoney/topbar';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useToast, toast } from './hooks';

