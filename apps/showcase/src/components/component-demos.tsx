'use client';

import React from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Avatar,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Checkbox,
  Input,
  Textarea,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Progress,
  Skeleton,
  Separator,
  Slider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  RadioGroup,
  RadioGroupItem,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ScrollArea,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Kbd,
  Spinner,
  Callout,
  MetricBlock,
  MetricsGrid,
  DataFreshnessIndicator,
  FilterBar,
  EmptyState,
  DateRangePicker,
  SignalCard,
  TickerSearch,
  RiskGauge,
  AllocationPie,
  ComparisonOverlay,
  PositionTable,
  ButtonGroup,
  InputGroup,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  CorrelationMatrix,
  // Premium components
  FadeIn, SlideIn, ScaleIn, StaggerChildren, AnimateOnScroll, ParallaxLayer,
  GradientText, BentoGrid, BentoGridItem, Marquee,
  ParticlesBackground, Dock, DockItem, CursorGlow, Spotlight,
  MorphingDialog, MorphingDialogTrigger, MorphingDialogContent,
  MagneticButton, AnimatedBadge, CountUp, Typewriter,
  AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent,
} from '@openmoney/ui';

import {
  ChevronRight,
  Settings,
  Search,
  X,
  AlertTriangle,
  Plus,
} from 'lucide-react';

function Section({ id, label, description, children }: {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {children}
      </div>
    </section>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function PreviewCardVertical({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">{children}</div>
      </CardContent>
    </Card>
  );
}

export function ComponentDemos() {
  return (
    <div className="space-y-0">
      {/* ═══════════════════ MOTION PRIMITIVES ═══════════════════ */}
      <Section id="motion" label="Motion Primitives" description="Composable animation primitives. 150ms-300ms, ease-out, no spring/bounce.">
        <PreviewCard title="FadeIn">
          <FadeIn duration={0.5} className="space-y-2">
            <p className="text-sm">This content fades in on mount</p>
            <FadeIn duration={0.5} delay={0.2}><Badge variant="outline">Nested</Badge></FadeIn>
          </FadeIn>
        </PreviewCard>

        <PreviewCard title="SlideIn (all directions)">
          <div className="grid grid-cols-2 gap-2">
            <SlideIn direction="up"><Badge>Up</Badge></SlideIn>
            <SlideIn direction="down"><Badge>Down</Badge></SlideIn>
            <SlideIn direction="left"><Badge>Left</Badge></SlideIn>
            <SlideIn direction="right"><Badge>Right</Badge></SlideIn>
          </div>
        </PreviewCard>

        <PreviewCard title="ScaleIn">
          <ScaleIn duration={0.3}>
            <div className="border border-border rounded-lg p-4 bg-surface-1 text-sm">Scaled from 0.95→1</div>
          </ScaleIn>
        </PreviewCard>

        <PreviewCard title="StaggerChildren">
          <StaggerChildren staggerDelay={0.08}>
            <div className="flex flex-wrap gap-2">
              {['First', 'Second', 'Third', 'Fourth'].map((label) => (
                <Badge key={label} variant="secondary">{label}</Badge>
              ))}
            </div>
          </StaggerChildren>
        </PreviewCard>

        <PreviewCard title="AnimateOnScroll (fade-up)">
          <AnimateOnScroll animation="fade-up" className="text-sm text-text-secondary">
            This animates when scrolled into view
          </AnimateOnScroll>
        </PreviewCard>

        <PreviewCard title="ParallaxLayer">
          <ParallaxLayer speed={0.3} className="border border-border rounded-lg p-4 bg-surface-1 text-sm">
            Parallax scroll effect (subtle)
          </ParallaxLayer>
        </PreviewCard>
      </Section>

      {/* ═══════════════════ PREMIUM COMPONENTS ═══════════════════ */}
      <Section id="premium" label="Premium" description="New animation-first components built on motion/react.">
        <PreviewCard title="GradientText">
          <GradientText gradientFrom="var(--brand)" gradientVia="var(--info)" gradientTo="var(--brand-hover)" animate>
            Premium gradient text
          </GradientText>
        </PreviewCard>

        <PreviewCard title="MagneticButton">
          <div className="flex gap-3">
            <MagneticButton strength={0.3}>
              <Button variant="outline">Hover me</Button>
            </MagneticButton>
            <MagneticButton strength={0.5}>
              <Button>Strong pull</Button>
            </MagneticButton>
          </div>
        </PreviewCard>

        <PreviewCard title="AnimatedBadge (variants)">
          <div className="flex flex-wrap gap-2">
            <AnimatedBadge>Default</AnimatedBadge>
            <AnimatedBadge variant="positive">+12.4%</AnimatedBadge>
            <AnimatedBadge variant="negative">-3.2%</AnimatedBadge>
            <AnimatedBadge variant="destructive">Error</AnimatedBadge>
            <AnimatedBadge variant="outline">Outline</AnimatedBadge>
          </div>
        </PreviewCard>

        <PreviewCard title="CountUp + Typewriter">
          <div className="space-y-2">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              <CountUp target={2400000} prefix="$" decimals={0} />
            </div>
            <p className="text-sm text-text-secondary">
              <Typewriter text="Animated text reveal for taglines and descriptions" speed={30} />
            </p>
          </div>
        </PreviewCard>

        <PreviewCard title="Spotlight">
          <Spotlight spotlightRadius={250}>
            <div className="p-6 text-sm text-center text-text-secondary">
              Move your cursor over this card <br />
              <span className="text-brand font-mono text-xs mt-1 block">Spotlight effect follows</span>
            </div>
          </Spotlight>
        </PreviewCard>

        <PreviewCard title="CursorGlow">
          <CursorGlow glowSize={350}>
            <div className="p-6 text-sm text-center text-text-secondary">
              Hover to reveal cursor glow <br />
              <span className="text-xs text-brand mt-1 block">Smooth spring interpolation</span>
            </div>
          </CursorGlow>
        </PreviewCard>

        <PreviewCard title="Marquee">
          <Marquee speed={40} fadeWidth={60} className="py-2 border border-border rounded-lg bg-surface-1">
            <div className="flex gap-8 text-sm text-text-secondary">
              {['React 19', 'TypeScript', 'Tailwind v4', 'motion/react', 'Radix UI', 'Next.js', 'Bun', 'Geist'].map((tech) => (
                <Badge key={tech} variant="secondary" className="font-mono text-[10px]">{tech}</Badge>
              ))}
            </div>
          </Marquee>
        </PreviewCard>

        <PreviewCard title="ParticlesBackground">
          <div className="relative h-32 rounded-lg overflow-hidden border border-border">
            <ParticlesBackground particleCount={30} color="var(--brand-dim)" speed="slow" connectDistance={120} className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary font-mono">
              Particle canvas overlay
            </div>
          </div>
        </PreviewCard>

        <PreviewCard title="Dock">
          <div className="h-24 flex items-end">
            <Dock magnification={1.4}>
              <DockItem label="Home" icon={ChevronRight} active />
              <DockItem label="Explore" icon={ChevronRight} />
              <DockItem label="Settings" icon={ChevronRight} />
              <DockItem label="Profile" icon={ChevronRight} />
            </Dock>
          </div>
        </PreviewCard>

        <PreviewCard title="MorphingDialog">
          <MorphingDialog>
            <MorphingDialogTrigger>
              <Button variant="outline" size="sm">Open Morphing Dialog</Button>
            </MorphingDialogTrigger>
            <MorphingDialogContent title="Morphing Animation" description="This dialog morphs from the trigger button using layoutId.">
              <p className="text-sm text-text-secondary">Smooth transition powered by motion/react layout animations.</p>
            </MorphingDialogContent>
          </MorphingDialog>
        </PreviewCard>

        <PreviewCard title="BentoGrid">
          <BentoGrid columns={3} gap="md">
            <BentoGridItem colSpan={2}><div className="bg-surface-1 border border-border rounded-lg p-4 text-sm font-mono">2×1</div></BentoGridItem>
            <BentoGridItem colSpan={1}><div className="bg-surface-1 border border-border rounded-lg p-4 text-sm font-mono">1×1</div></BentoGridItem>
            <BentoGridItem colSpan={1}><div className="bg-surface-1 border border-border rounded-lg p-4 text-sm font-mono">1×1</div></BentoGridItem>
            <BentoGridItem colSpan={2}><div className="bg-surface-1 border border-border rounded-lg p-4 text-sm font-mono">2×1</div></BentoGridItem>
          </BentoGrid>
        </PreviewCard>

        <PreviewCard title="AnimatedTabs">
          <AnimatedTabs defaultValue="one">
            <AnimatedTabsList>
              <AnimatedTabsTrigger value="one">Tab One</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="two">Tab Two</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="three">Tab Three</AnimatedTabsTrigger>
            </AnimatedTabsList>
            <AnimatedTabsContent value="one"><p className="text-sm text-text-secondary p-4">Content for tab one</p></AnimatedTabsContent>
            <AnimatedTabsContent value="two"><p className="text-sm text-text-secondary p-4">Content for tab two</p></AnimatedTabsContent>
            <AnimatedTabsContent value="three"><p className="text-sm text-text-secondary p-4">Content for tab three</p></AnimatedTabsContent>
          </AnimatedTabs>
        </PreviewCard>
      </Section>

      {/* ── Buttons ── */}
      <Section id="buttons" label="Buttons" description="Interactive triggers for user actions.">
        <PreviewCard title="Variants (6)">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </PreviewCard>

        <PreviewCard title="Sizes (sm/default/lg/icon)">
          <Button size="sm">Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Settings /></Button>
        </PreviewCard>

        <PreviewCard title="Button Group">
          <ButtonGroup>
            <Button variant="outline" size="sm">Day</Button>
            <Button variant="outline" size="sm">Week</Button>
            <Button variant="outline" size="sm">Month</Button>
            <Button variant="outline" size="sm">Year</Button>
          </ButtonGroup>
        </PreviewCard>

        <PreviewCard title="Toggle">
          <Toggle aria-label="Toggle B">B</Toggle>
          <Toggle aria-label="Toggle I"><span className="italic">I</span></Toggle>
          <Toggle aria-label="Toggle U"><span className="underline">U</span></Toggle>
        </PreviewCard>

        <PreviewCard title="Toggle Group">
          <ToggleGroup type="multiple" defaultValue={['b']}>
            <ToggleGroupItem value="b">B</ToggleGroupItem>
            <ToggleGroupItem value="i"><span className="italic">I</span></ToggleGroupItem>
            <ToggleGroupItem value="u"><span className="underline">U</span></ToggleGroupItem>
          </ToggleGroup>
        </PreviewCard>
      </Section>

      {/* ── Forms ── */}
      <Section id="forms" label="Forms & Input" description="User input controls with consistent validation states.">
        <PreviewCardVertical title="Input (default, disabled, with icon)">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Search..." />
        </PreviewCardVertical>

        <PreviewCardVertical title="Input Group">
          <InputGroup>
            <Input placeholder="Search..." className="flex-1" />
            <Button size="sm"><Search /></Button>
          </InputGroup>
          <InputGroup>
            <Select>
              <SelectTrigger className="w-24"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eqty">Equity</SelectItem>
                <SelectItem value="fx">Forex</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search tickers..." className="flex-1" />
          </InputGroup>
        </PreviewCardVertical>

        <PreviewCardVertical title="Textarea">
          <Textarea placeholder="Type your message..." />
          <Textarea placeholder="Disabled" disabled />
        </PreviewCardVertical>

        <PreviewCard title="Select">
          <Select>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select asset class..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="fixed-income">Fixed Income</SelectItem>
              <SelectItem value="commodity">Commodity</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
            </SelectContent>
          </Select>
        </PreviewCard>

        <PreviewCard title="Checkbox">
          <label className="flex items-center gap-2 text-sm"><Checkbox /> Unchecked</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Checked</label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox disabled /> Disabled</label>
        </PreviewCard>

        <PreviewCard title="Radio Group">
          <RadioGroup defaultValue="market" className="gap-2">
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="market" /> Market Order</label>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="limit" /> Limit Order</label>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="stop" /> Stop Order</label>
          </RadioGroup>
        </PreviewCard>

        <PreviewCard title="Switch">
          <div className="flex items-center gap-2 text-sm"><Switch /> Dark Mode</div>
          <div className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Notifications</div>
        </PreviewCard>

        <PreviewCard title="Slider (single / range)">
          <div className="w-full px-2">
            <Slider defaultValue={[50]} max={100} step={1} />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0</span>
              <span className="text-xs text-muted-foreground">100</span>
            </div>
          </div>
        </PreviewCard>

        <PreviewCard title="Label + Field">
          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="demo-name">Position Name</Label>
            <Input id="demo-name" placeholder="My Portfolio" />
          </div>
        </PreviewCard>
      </Section>

      {/* ── Navigation ── */}
      <Section id="navigation" label="Navigation" description="Guide users through content hierarchy.">
        <PreviewCardVertical title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
              Portfolio summary and key metrics.
            </TabsContent>
            <TabsContent value="holdings" className="pt-3 text-sm text-muted-foreground">
              Complete list of positions.
            </TabsContent>
            <TabsContent value="risk" className="pt-3 text-sm text-muted-foreground">
              Risk metrics and VaR analysis.
            </TabsContent>
          </Tabs>
        </PreviewCardVertical>

        <PreviewCard title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Portfolio</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Risk</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>VaR Analysis</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PreviewCard>
      </Section>

      {/* ── Overlays ── */}
      <Section id="overlays" label="Overlays & Modals" description="Floating panels for secondary interactions.">
        <PreviewCard title="Dialog">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="sm">Open Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>This action cannot be undone. Proceed?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PreviewCard>

        <PreviewCard title="Alert Dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete Item</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this item.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
                <AlertDialogAction variant="default" size="default">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PreviewCard>

        <PreviewCard title="Sheet">
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm">Open Sheet</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground mt-4">Manage your application preferences.</p>
            </SheetContent>
          </Sheet>
        </PreviewCard>

        <PreviewCard title="Popover">
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" size="sm">Open Popover</Button></PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">You have 3 new alerts.</p>
              </div>
            </PopoverContent>
          </Popover>
        </PreviewCard>

        <PreviewCard title="Tooltip">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
              <TooltipContent side="top"><p>Tooltip text</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </PreviewCard>

        <PreviewCard title="Hover Card">
          <HoverCard>
            <HoverCardTrigger asChild><span className="text-sm underline underline-offset-4 decoration-dotted cursor-help">@openmoney</span></HoverCardTrigger>
            <HoverCardContent className="w-72">
              <div className="flex gap-3">
                <Avatar><AvatarFallback className="bg-accent-brand text-xs">OM</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">OpenMoney</p>
                  <p className="text-xs text-muted-foreground">Quantitative investment research platform. Open-source. Precision-first.</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </PreviewCard>
      </Section>

      {/* ── Data Display ── */}
      <Section id="data-display" label="Data Display" description="Present information with clarity and precision.">
        <PreviewCard title="Badge (default/secondary/destructive/outline)">
          <Badge>Portfolio</Badge>
          <Badge variant="secondary">Bonds</Badge>
          <Badge variant="destructive">Risk Alert</Badge>
          <Badge variant="outline">Draft</Badge>
        </PreviewCard>

        <PreviewCard title="Avatar">
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="bg-[var(--success-muted)] text-[var(--success)] text-xs">AG</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="bg-accent-brand/20 text-accent-brand text-xs">OM</AvatarFallback></Avatar>
        </PreviewCard>

        <PreviewCardVertical title="Accordion">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="1">
              <AccordionTrigger className="text-sm">What is OpenMoney?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                An open-source quantitative investment research platform.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="text-sm">How are providers handled?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Bring your own API keys. Multiple providers per data model.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PreviewCardVertical>

        <PreviewCardVertical title="Card">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Summary</CardTitle>
              <CardDescription>Last updated 2 min ago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div><p className="text-2xl font-mono font-semibold">$284,530</p><p className="text-xs text-muted-foreground">Total Value</p></div>
                <div><p className="text-2xl font-mono font-semibold text-[var(--success)]">+2.3%</p><p className="text-xs text-muted-foreground">MTD</p></div>
              </div>
            </CardContent>
          </Card>
        </PreviewCardVertical>

        <PreviewCardVertical title="Collapsible">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors">
              <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              Advanced Settings
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 ml-6 text-sm text-muted-foreground space-y-1">
              <p>Rebalancing threshold: 5%</p>
              <p>Max position size: 25%</p>
            </CollapsibleContent>
          </Collapsible>
        </PreviewCardVertical>

        <PreviewCard title="Kbd">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Press <Kbd>⌘</Kbd><Kbd>K</Kbd> to search
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Kbd>⌘</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd> command palette
          </div>
        </PreviewCard>

        <PreviewCard title="Progress">
          <div className="w-full flex flex-col gap-3">
            <div className="flex justify-between text-xs"><span>Downloading data...</span><span className="font-mono text-muted-foreground">33%</span></div>
            <Progress value={33} />
            <div className="flex justify-between text-xs"><span className="text-[var(--success)]">Processing batches...</span><span className="font-mono text-muted-foreground">66%</span></div>
            <Progress value={66} />
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Complete</span><span className="font-mono text-muted-foreground">100%</span></div>
            <Progress value={100} />
          </div>
        </PreviewCard>

        <PreviewCard title="Skeleton">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div>
          </div>
          <div className="space-y-2 mt-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </PreviewCard>

        <PreviewCard title="Spinner">
          <Spinner />
          <Spinner className="text-accent-brand" />
          <Spinner className="size-6 text-[var(--success)]" />
          <Spinner className="size-4 text-[var(--warning)]" />
        </PreviewCard>

        <PreviewCardVertical title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ticker</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono font-medium">AAPL</TableCell>
                <TableCell>Apple Inc.</TableCell>
                <TableCell className="text-right font-mono">$198.50</TableCell>
                <TableCell className="text-right font-mono text-[var(--success)]">+1.2%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium">MSFT</TableCell>
                <TableCell>Microsoft</TableCell>
                <TableCell className="text-right font-mono">$425.30</TableCell>
                <TableCell className="text-right font-mono text-[var(--destructive)]">-0.8%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-medium">GOOGL</TableCell>
                <TableCell>Alphabet</TableCell>
                <TableCell className="text-right font-mono">$175.20</TableCell>
                <TableCell className="text-right font-mono text-[var(--success)]">+0.5%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </PreviewCardVertical>

        <PreviewCardVertical title="Scroll Area">
          <ScrollArea className="h-28 border border-border rounded-md p-3">
            <div className="space-y-1.5 text-sm">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">Position #{i + 1}</span>
                  <span className="font-mono text-muted-foreground">$1,2{i}0.00</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PreviewCardVertical>

        <PreviewCard title="Separator">
          <div className="w-full flex flex-col gap-2">
            <Separator />
            <p className="text-xs text-muted-foreground">divider</p>
          </div>
        </PreviewCard>
      </Section>

      {/* ── Feedback ── */}
      <Section id="feedback" label="Feedback" description="Communicate state changes and system status.">
        <PreviewCardVertical title="Alert (default / destructive)">
          <Alert>
            <AlertTriangle className="size-4" />
            <AlertTitle>Portfolio threshold</AlertTitle>
            <AlertDescription>Portfolio VaR at 3.2% — above 2.5% threshold. Consider rebalancing.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <X className="size-4" />
            <AlertTitle>Data fetch failed</AlertTitle>
            <AlertDescription>Provider returned no data for XYZ. Retrying in 30s.</AlertDescription>
          </Alert>
        </PreviewCardVertical>
      </Section>

      {/* ── Domain Components ── */}
      <Section id="domain" label="Domain Components" description="OpenMoney-specific financial components.">
        <PreviewCard title="Callout (info/warn/error/success)">
          <Callout type="info" title="Market Status">US markets open. Regular trading session.</Callout>
          <Callout type="warn" title="Drawdown Alert">Drawdown exceeds 10% threshold. Review positions.</Callout>
          <Callout type="error" title="Rate Limit">API rate limit reached. Backoff 60 seconds.</Callout>
          <Callout type="success" title="Rebalance">Portfolio rebalanced successfully.</Callout>
        </PreviewCard>

        <PreviewCardVertical title="Metric Block">
          <div className="flex gap-12">
            <MetricBlock label="Portfolio Value" value="$284,530" change={{ value: "+2.3%", direction: "up" }} />
          </div>
          <div className="flex gap-12">
            <MetricBlock label="Daily P&L" value="-$1,240" change={{ value: "-0.4%", direction: "down" }} />
          </div>
        </PreviewCardVertical>

        <PreviewCardVertical title="Metrics Grid">
          <MetricsGrid
            items={[
              { label: 'Total Value', value: '$284,530', change: { value: '+2.3%', direction: 'up' } },
              { label: 'Day Change', value: '-$1,240', change: { value: '-0.4%', direction: 'down' } },
              { label: 'Sharpe Ratio', value: '1.84', change: { value: '+0.12', direction: 'up' } },
              { label: 'VaR (95%)', value: '2.1%', change: { value: '-0.3%', direction: 'down' } },
            ]}
            columns={4}
          />
        </PreviewCardVertical>

        <PreviewCard title="Data Freshness">
          <DataFreshnessIndicator state="live" label="Real-time" />
          <DataFreshnessIndicator state="recent" label="45s ago" />
          <DataFreshnessIndicator state="stale" label="15m ago" />
          <DataFreshnessIndicator state="delayed" label="EOD" />
        </PreviewCard>

        <PreviewCardVertical title="Filter Bar">
          <FilterBar
            filters={[
              { id: 'sector', label: 'Sector', options: [{ value: 'tech', label: 'Tech' }, { value: 'fin', label: 'Finance' }] },
              { id: 'region', label: 'Region', options: [{ value: 'us', label: 'US' }, { value: 'eu', label: 'EU' }] },
            ]}
            activeFilters={[]}
            onClear={() => {}}
          />
        </PreviewCardVertical>

        <PreviewCard title="Empty State">
          <EmptyState
            title="No positions yet"
            description="Add your first position to start tracking your portfolio."
            action={{ label: 'Add Position', onClick: () => {} }}
          />
        </PreviewCard>

        <PreviewCardVertical title="Signal Card">
          <SignalCard
            title="Tech Sector Overweight"
            description="Technology sector allocation at 45% — 10% above benchmark weight. Consider rebalancing toward target of 35%."
            action="reduce"
            confidence={82}
            createdAt="2025-03-15T09:30:00Z"
          />
        </PreviewCardVertical>

        <PreviewCardVertical title="Ticker Search">
          <TickerSearch />
        </PreviewCardVertical>

        <PreviewCardVertical title="Risk Gauge">
          <RiskGauge value={35} max={100} label="Portfolio Risk" />
        </PreviewCardVertical>

        <PreviewCardVertical title="Allocation Pie">
          <AllocationPie
            segments={[
              { label: 'Technology', value: 42, color: '#059669' },
              { label: 'Finance', value: 28, color: '#2563EB' },
              { label: 'Energy', value: 18, color: '#D97706' },
              { label: 'Healthcare', value: 12, color: '#7C3AED' },
            ]}
            totalLabel="Total Portfolio"
          />
        </PreviewCardVertical>

        <PreviewCardVertical title="Position Table">
          <PositionTable
            positions={[
              { id: '1', ticker: 'AAPL', name: 'Apple Inc.', quantity: 100, avgPrice: 185.50, currentPrice: 198.50, openedAt: '2025-01-15' },
              { id: '2', ticker: 'MSFT', name: 'Microsoft Corp.', quantity: 50, avgPrice: 410.20, currentPrice: 425.30, openedAt: '2025-02-01' },
              { id: '3', ticker: 'GOOGL', name: 'Alphabet Inc.', quantity: 75, avgPrice: 168.80, currentPrice: 175.20, openedAt: '2025-03-10' },
            ]}
          />
        </PreviewCardVertical>

        <PreviewCardVertical title="Comparison Overlay">
          <ComparisonOverlay
            items={[
              { ticker: 'AAPL', color: '#059669', visible: true },
              { ticker: 'MSFT', color: '#2563EB', visible: true },
              { ticker: 'GOOGL', color: '#7C3AED', visible: true },
            ]}
            onToggleVisibility={() => {}}
            onRemove={() => {}}
            onAddTicker={() => {}}
            benchmark="SPY"
          />
        </PreviewCardVertical>

        <PreviewCardVertical title="Date Range Picker">
          <DateRangePicker
            value={{ from: new Date('2025-01-01'), to: new Date('2025-03-31') }}
            onChange={() => {}}
          />
        </PreviewCardVertical>

        <PreviewCardVertical title="Correlation Matrix">
          <CorrelationMatrix
            data={[
              { ticker: 'AAPL', correlations: { AAPL: 1, MSFT: 0.85, GOOGL: 0.72 } },
              { ticker: 'MSFT', correlations: { AAPL: 0.85, MSFT: 1, GOOGL: 0.68 } },
              { ticker: 'GOOGL', correlations: { AAPL: 0.72, MSFT: 0.68, GOOGL: 1 } },
            ]}
          />
        </PreviewCardVertical>
      </Section>
    </div>
  );
}
