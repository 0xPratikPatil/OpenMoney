'use client';

import * as React from 'react';

import {
  Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Alert, AlertTitle, AlertDescription,
  Avatar, AvatarFallback,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Switch, Checkbox, Input, Textarea, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Progress, Skeleton, Separator, Slider,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  Popover, PopoverTrigger, PopoverContent,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  RadioGroup, RadioGroupItem,
  Toggle, ToggleGroup, ToggleGroupItem,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
  HoverCard, HoverCardTrigger, HoverCardContent,
  ScrollArea, Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Kbd, Spinner,
  Callout, MetricBlock, MetricsGrid, DataFreshnessIndicator, FilterBar,
  EmptyState, DateRangePicker, SignalCard, TickerSearch, RiskGauge,
  AllocationPie, ComparisonOverlay, PositionTable,
  ButtonGroup, InputGroup,
  Collapsible, CollapsibleTrigger, CollapsibleContent,
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
  CorrelationMatrix,
  DeltaBadge, SparklineBar, MetricCard, StatusBadge, LiveIndicator,
  SignalGauge, PriorityBadge, TagChip,
  FadeIn, SlideIn, ScaleIn, StaggerChildren, AnimateOnScroll, ParallaxLayer,
  GradientText, BentoGrid, BentoGridItem, Marquee,
  ParticlesBackground, Dock, DockItem, CursorGlow, Spotlight,
  MorphingDialog, MorphingDialogTrigger, MorphingDialogContent,
  MagneticButton, AnimatedBadge, CountUp, Typewriter,
  AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent,
} from '@openmoney/ui';

import {
  Search, X, AlertTriangle, ChevronRight,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────────
   Component Demos — mirrors tokens page quality
   Sections: Buttons → Forms → Navigation → Overlays → Data Display → Feedback → Motion → Premium → Domain
   ─────────────────────────────────────────────────────────────── */

export function ComponentDemos() {
  const sparkData = React.useMemo(() => Array.from({ length: 20 }, () => Math.random()), []);

  return (
    <div className="space-y-16 pt-4 lg:pt-0">
      <ButtonsBlock />
      <FormsBlock />
      <NavigationBlock />
      <OverlaysBlock />
      <DataDisplayBlock />
      <FeedbackBlock />
      <MotionBlock />
      <PremiumBlock />
      <DomainBlock sparkData={sparkData} />
    </div>
  );
}

/* ── Section ── */
function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-8">
      <div className="flex items-baseline justify-between border-b border-foreground/10 pb-3">
        <h2 className="text-lg md:text-xl tracking-tight">{title}</h2>
        <span className="text-[11px] font-mono text-foreground/40">{eyebrow}</span>
      </div>
      <div className="space-y-10">{children}</div>
    </section>
  );
}

function Subsection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="text-[13px] text-foreground/50 leading-relaxed max-w-prose">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

/* ── Preview Card ── */
function PreviewCard({ title, code, children }: { title: string; code?: string; children: React.ReactNode }) {
  return (
    <div className="border border-foreground/10 p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">{title}</p>
        {code ? <p className="text-[10px] font-mono text-foreground/40">{code}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function PreviewCardVertical({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-foreground/10 p-4 space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

/* ── Code Snippet ── */
function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="font-mono text-xs bg-foreground/[0.03] border border-foreground/10 overflow-x-auto p-3">
      <code>{code}</code>
    </pre>
  );
}

/* ── Buttons ── */
function ButtonsBlock() {
  return (
    <Section id="buttons" eyebrow="01" title="Buttons">
      <Subsection title="Variants" description="Six variants, four sizes. All share the same base text style.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4 space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          <CodeSnippet code={`<Button>Default</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="link">Link</Button>\n<Button variant="destructive">Destructive</Button>`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4 space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path d="M5 12h14M12 5v14" strokeLinecap="round" /></svg>
              </Button>
            </div>
          </div>
          <CodeSnippet code={`<Button size="sm">Small</Button>\n<Button>Default</Button>\n<Button size="lg">Large</Button>\n<Button size="icon"><Icon /></Button>`} />
        </div>
      </Subsection>

      <Subsection title="Button Group" description="Toggle-style segmented controls.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Button Group">
            <ButtonGroup>
              <Button variant="outline" size="sm">Day</Button>
              <Button variant="outline" size="sm">Week</Button>
              <Button variant="outline" size="sm">Month</Button>
              <Button variant="outline" size="sm">Year</Button>
            </ButtonGroup>
          </PreviewCard>
          <CodeSnippet code={`<ButtonGroup>\n  <Button variant="outline" size="sm">Day</Button>\n  <Button variant="outline" size="sm">Week</Button>\n  <Button variant="outline" size="sm">Month</Button>\n  <Button variant="outline" size="sm">Year</Button>\n</ButtonGroup>`} />
        </div>
      </Subsection>

      <Subsection title="Toggle" description="Binary on/off controls.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Forms ── */
function FormsBlock() {
  return (
    <Section id="forms" eyebrow="02" title="Forms & Input">
      <Subsection title="Input" description="Sharp, minimal affordances.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4 space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50">Input States</p>
            <Input placeholder="Default input" />
            <Input placeholder="Disabled" disabled />
            <Input placeholder="Search..." />
          </div>
          <CodeSnippet code={`<Input placeholder="Default input" />\n<Input placeholder="Disabled" disabled />\n<Input placeholder="Search..." />`} />
        </div>
      </Subsection>

      <Subsection title="Input Group" description="Composite input with attached buttons or selects.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Input Group">
            <InputGroup>
              <Input placeholder="Search..." className="flex-1" />
              <Button size="sm"><Search className="size-4" /></Button>
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
          <CodeSnippet code={`<InputGroup>\n  <Input placeholder="Search..." />\n  <Button size="sm"><Icon /></Button>\n</InputGroup>`} />
        </div>
      </Subsection>

      <Subsection title="Textarea" description="Multi-line text input.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Textarea">
            <Textarea placeholder="Type your message..." />
            <Textarea placeholder="Disabled" disabled />
          </PreviewCardVertical>
          <CodeSnippet code={`<Textarea placeholder="Type your message..." />`} />
        </div>
      </Subsection>

      <Subsection title="Select" description="Dropdown for selecting from a list.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Select">
            <Select>
              <SelectTrigger className="w-48">
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
          <CodeSnippet code={`<Select>\n  <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>\n  <SelectContent>\n    <SelectItem value="equity">Equity</SelectItem>\n    ...\n  </SelectContent>\n</Select>`} />
        </div>
      </Subsection>

      <Subsection title="Checkbox & Radio" description="Selection controls.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Checkbox">
            <label className="flex items-center gap-2 text-sm"><Checkbox /> Unchecked</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Checked</label>
            <label className="flex items-center gap-2 text-sm text-foreground/50"><Checkbox disabled /> Disabled</label>
          </PreviewCardVertical>
          <PreviewCardVertical title="Radio Group">
            <RadioGroup defaultValue="market" className="gap-2">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="market" /> Market Order</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="limit" /> Limit Order</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="stop" /> Stop Order</label>
            </RadioGroup>
          </PreviewCardVertical>
        </div>
      </Subsection>

      <Subsection title="Switch & Slider" description="Boolean toggle and range input.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Switch">
            <label className="flex items-center gap-2 text-sm"><Switch /> Dark Mode</label>
            <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Notifications</label>
          </PreviewCardVertical>
          <PreviewCard title="Slider">
            <div className="w-48">
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
          </PreviewCard>
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Navigation ── */
function NavigationBlock() {
  return (
    <Section id="navigation" eyebrow="03" title="Navigation">
      <Subsection title="Tabs" description="Content switchers for related views.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3 text-sm text-foreground/60">
                Portfolio summary and key metrics.
              </TabsContent>
              <TabsContent value="holdings" className="pt-3 text-sm text-foreground/60">
                Complete list of positions.
              </TabsContent>
              <TabsContent value="risk" className="pt-3 text-sm text-foreground/60">
                Risk metrics and VaR analysis.
              </TabsContent>
            </Tabs>
          </div>
          <CodeSnippet code={`<Tabs defaultValue="overview">\n  <TabsList>\n    <TabsTrigger value="overview">Overview</TabsTrigger>\n    <TabsTrigger value="holdings">Holdings</TabsTrigger>\n  </TabsList>\n  <TabsContent value="overview">...</TabsContent>\n</Tabs>`} />
        </div>
      </Subsection>

      <Subsection title="Breadcrumb" description="Hierarchical navigation trail.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <CodeSnippet code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem><BreadcrumbLink>Portfolio</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbPage>VaR</BreadcrumbPage></BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`} />
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Overlays ── */
function OverlaysBlock() {
  return (
    <Section id="overlays" eyebrow="04" title="Overlays & Modals">
      <Subsection title="Dialog" description="Modal for confirmations or focused content.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <CodeSnippet code={`<Dialog>\n  <DialogTrigger><Button>Open</Button></DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Confirm</DialogTitle>\n      <DialogDescription>...</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>...</DialogFooter>\n  </DialogContent>\n</Dialog>`} />
        </div>
      </Subsection>

      <Subsection title="Alert Dialog" description="Destructive confirmation modal.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Alert Dialog">
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete Item</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete this item.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PreviewCard>
          <CodeSnippet code={`<AlertDialog>\n  <AlertDialogTrigger>\n    <Button variant="destructive">Delete</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>...</AlertDialogHeader>\n    <AlertDialogFooter>...</AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`} />
        </div>
      </Subsection>

      <Subsection title="Sheet" description="Slide-out panel from screen edge.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Sheet">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Open Sheet</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Settings</SheetTitle></SheetHeader>
                <p className="text-sm text-foreground/60 mt-4">Manage your application preferences.</p>
              </SheetContent>
            </Sheet>
          </PreviewCard>
          <CodeSnippet code={`<Sheet>\n  <SheetTrigger><Button>Open</Button></SheetTrigger>\n  <SheetContent>\n    <SheetHeader><SheetTitle>Settings</SheetTitle></SheetHeader>\n  </SheetContent>\n</Sheet>`} />
        </div>
      </Subsection>

      <Subsection title="Popover & Tooltip" description="Floating contextual panels.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Popover">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm">Open Popover</Button></PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-foreground/60">You have 3 new alerts.</p>
                </div>
              </PopoverContent>
            </Popover>
          </PreviewCard>
          <PreviewCard title="Tooltip">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
                <TooltipContent><p>Tooltip text</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PreviewCard>
        </div>
      </Subsection>

      <Subsection title="Hover Card" description="Rich preview on hover.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Hover Card">
            <HoverCard>
              <HoverCardTrigger asChild><span className="text-sm underline decoration-dotted underline-offset-4 cursor-help">@openmoney</span></HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="flex gap-3">
                  <Avatar><AvatarFallback className="text-xs">OM</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">OpenMoney</p>
                    <p className="text-xs text-foreground/60">Open-source quantitative investment research platform.</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </PreviewCard>
          <CodeSnippet code={`<HoverCard>\n  <HoverCardTrigger>\n    <span>@openmoney</span>\n  </HoverCardTrigger>\n  <HoverCardContent>...</HoverCardContent>\n</HoverCard>`} />
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Data Display ── */
function DataDisplayBlock() {
  return (
    <Section id="data-display" eyebrow="05" title="Data Display">
      <Subsection title="Badges" description="Status indicators and labels.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Badge Variants">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge variant="outline">outline</Badge>
          </PreviewCard>
          <CodeSnippet code={`<Badge>default</Badge>\n<Badge variant="secondary">secondary</Badge>\n<Badge variant="destructive">destructive</Badge>\n<Badge variant="outline">outline</Badge>`} />
        </div>
      </Subsection>

      <Subsection title="Avatar" description="User or entity representation.">
        <PreviewCard title="Avatar">
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="text-xs">AG</AvatarFallback></Avatar>
          <Avatar><AvatarFallback className="text-xs">OM</AvatarFallback></Avatar>
        </PreviewCard>
      </Subsection>

      <Subsection title="Card" description="Flat border, no shadow. Dashed footer rules for metadata.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portfolio Summary</CardTitle>
                <CardDescription>Last updated 2 min ago</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <div><p className="text-2xl font-mono font-semibold">$284,530</p><p className="text-xs text-foreground/50">Total Value</p></div>
                  <div><p className="text-2xl font-mono font-semibold text-[var(--success)]">+2.3%</p><p className="text-xs text-foreground/50">MTD</p></div>
                </div>
              </CardContent>
              <CardFooter><span className="text-[11px] font-mono text-foreground/50">v0.0.1</span></CardFooter>
            </Card>
          </div>
          <CodeSnippet code={`<Card>\n  <CardHeader>\n    <CardTitle>Portfolio Summary</CardTitle>\n    <CardDescription>Last updated 2 min ago</CardDescription>\n  </CardHeader>\n  <CardContent>$284,530</CardContent>\n  <CardFooter>meta</CardFooter>\n</Card>`} />
        </div>
      </Subsection>

      <Subsection title="Accordion" description="Expandable content sections.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Accordion">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1">
                <AccordionTrigger className="text-sm">What is OpenMoney?</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/60">
                  An open-source quantitative investment research platform.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger className="text-sm">How are providers handled?</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/60">
                  Bring your own API keys. Multiple providers per data model.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </PreviewCardVertical>
          <CodeSnippet code={`<Accordion type="single" collapsible>\n  <AccordionItem value="1">\n    <AccordionTrigger>Title</AccordionTrigger>\n    <AccordionContent>Content</AccordionContent>\n  </AccordionItem>\n</Accordion>`} />
        </div>
      </Subsection>

      <Subsection title="Collapsible" description="Toggle visibility of content.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Collapsible">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors">
                <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                Advanced Settings
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 ml-6 text-sm text-foreground/60 space-y-1">
                <p>Rebalancing threshold: 5%</p>
                <p>Max position size: 25%</p>
              </CollapsibleContent>
            </Collapsible>
          </PreviewCardVertical>
          <CodeSnippet code={`<Collapsible>\n  <CollapsibleTrigger>\n    <Icon /> Title\n  </CollapsibleTrigger>\n  <CollapsibleContent>...</CollapsibleContent>\n</Collapsible>`} />
        </div>
      </Subsection>

      <Subsection title="Table" description="Structured data in rows and columns.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4">
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
              </TableBody>
            </Table>
          </div>
          <CodeSnippet code={`<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Ticker</TableHead>\n      ...\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>...</TableRow>\n  </TableBody>\n</Table>`} />
        </div>
      </Subsection>

      <Subsection title="Progress & Skeleton" description="Loading indicators.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Progress">
            <Progress value={33} />
            <Progress value={66} />
            <Progress value={100} />
          </PreviewCardVertical>
          <PreviewCardVertical title="Skeleton">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div>
            </div>
            <div className="space-y-2 mt-3">
              <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" />
            </div>
          </PreviewCardVertical>
        </div>
      </Subsection>

      <Subsection title="Miscellaneous" description="Spinner, Kbd, ScrollArea, Separator.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="Spinner">
            <Spinner />
            <Spinner className="size-6 text-[var(--success)]" />
            <Spinner className="size-4 text-[var(--warning)]" />
          </PreviewCard>
          <PreviewCard title="Kbd">
            <span className="text-sm text-foreground/60 flex items-center gap-1">
              Press <Kbd>⌘</Kbd><Kbd>K</Kbd>
            </span>
          </PreviewCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Scroll Area">
            <ScrollArea className="h-24 border border-foreground/10 rounded-md p-3">
              <div className="space-y-1 text-sm text-foreground/60">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Position #{i + 1}</span><span className="font-mono">$1,2{i}0.00</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PreviewCardVertical>
          <PreviewCard title="Separator">
            <div className="w-full flex flex-col gap-2">
              <Separator />
              <p className="text-[10px] font-mono text-foreground/40">divider</p>
            </div>
          </PreviewCard>
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Feedback ── */
function FeedbackBlock() {
  return (
    <Section id="feedback" eyebrow="06" title="Feedback">
      <Subsection title="Alert" description="System messages and status notifications.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Alert (default / destructive)">
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertTitle>Portfolio threshold</AlertTitle>
              <AlertDescription>VaR at 3.2% — exceeding 2.5% threshold. Consider rebalancing.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <X className="size-4" />
              <AlertTitle>Data fetch failed</AlertTitle>
              <AlertDescription>Provider returned no data. Retrying in 30s.</AlertDescription>
            </Alert>
          </PreviewCardVertical>
          <CodeSnippet code={`<Alert>\n  <AlertTriangle />\n  <AlertTitle>Title</AlertTitle>\n  <AlertDescription>Detail</AlertDescription>\n</Alert>\n\n<Alert variant="destructive">...</Alert>`} />
        </div>
      </Subsection>
    </Section>
  );
}

/* ── Motion ── */
function MotionBlock() {
  return (
    <Section id="motion" eyebrow="07" title="Motion Primitives">
      <Subsection title="FadeIn" description="Opacity entrance animation. 150-400ms, ease-out.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="FadeIn">
            <FadeIn duration={0.5}>
              This content fades in on mount
            </FadeIn>
          </PreviewCard>
          <CodeSnippet code={`<FadeIn duration={0.5}>\n  Content fades in on mount\n</FadeIn>`} />
        </div>
      </Subsection>

      <Subsection title="SlideIn" description="Directional slide entrance.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="SlideIn (all directions)">
            <div className="grid grid-cols-2 gap-2">
              <SlideIn direction="up"><Badge>Up</Badge></SlideIn>
              <SlideIn direction="down"><Badge>Down</Badge></SlideIn>
              <SlideIn direction="left"><Badge>Left</Badge></SlideIn>
              <SlideIn direction="right"><Badge>Right</Badge></SlideIn>
            </div>
          </PreviewCard>
          <CodeSnippet code={`<SlideIn direction="up"><Badge>Up</Badge></SlideIn>\n<SlideIn direction="right"><Badge>Right</Badge></SlideIn>`} />
        </div>
      </Subsection>

      <Subsection title="ScaleIn" description="Scale from 0.95 to 1 with opacity fade.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="ScaleIn">
            <ScaleIn duration={0.3}>
              <div className="border border-foreground/10 p-4 text-sm">Scaled from 0.95 → 1</div>
            </ScaleIn>
          </PreviewCard>
          <CodeSnippet code={`<ScaleIn duration={0.3}>\n  <div>Content</div>\n</ScaleIn>`} />
        </div>
      </Subsection>

      <Subsection title="StaggerChildren" description="Staggered entrance for child elements.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="StaggerChildren">
            <StaggerChildren staggerDelay={0.08}>
              <div className="flex flex-wrap gap-2">
                {['First', 'Second', 'Third', 'Fourth'].map((label) => (
                  <Badge key={label} variant="secondary">{label}</Badge>
                ))}
              </div>
            </StaggerChildren>
          </PreviewCard>
          <CodeSnippet code={`<StaggerChildren staggerDelay={0.08}>\n  <div className="flex gap-2">\n    {items.map(i => <Badge>{i}</Badge>)}\n  </div>\n</StaggerChildren>`} />
        </div>
      </Subsection>

      <Subsection title="AnimateOnScroll" description="Triggers animation when element enters viewport.">
        <PreviewCard title="AnimateOnScroll (fade-up)">
          <AnimateOnScroll animation="fade-up" className="text-sm text-foreground/60">
            This animates when scrolled into view
          </AnimateOnScroll>
        </PreviewCard>
      </Subsection>

      <Subsection title="ParallaxLayer" description="Subtle parallax on scroll.">
        <PreviewCard title="ParallaxLayer">
          <ParallaxLayer speed={0.3} className="border border-foreground/10 p-4 text-sm">
            Parallax scroll effect (subtle)
          </ParallaxLayer>
        </PreviewCard>
      </Subsection>
    </Section>
  );
}

/* ── Premium ── */
function PremiumBlock() {
  return (
    <Section id="premium" eyebrow="08" title="Premium Components">
      <Subsection title="GradientText" description="Animated gradient text treatment.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="GradientText">
            <GradientText gradientFrom="var(--brand)" gradientVia="var(--info)" gradientTo="var(--brand-hover)" animate>
              Premium gradient text
            </GradientText>
          </PreviewCard>
          <CodeSnippet code={`<GradientText gradientFrom="var(--brand)" gradientTo="var(--info)" animate>\n  Text with animated gradient\n</GradientText>`} />
        </div>
      </Subsection>

      <Subsection title="MagneticButton" description="Button that follows cursor on hover.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <CodeSnippet code={`<MagneticButton strength={0.3}>\n  <Button variant="outline">Hover me</Button>\n</MagneticButton>`} />
        </div>
      </Subsection>

      <Subsection title="AnimatedBadge" description="Pulse/stagger badge variants.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="AnimatedBadge">
            <AnimatedBadge>Default</AnimatedBadge>
            <AnimatedBadge variant="positive">+12.4%</AnimatedBadge>
            <AnimatedBadge variant="negative">-3.2%</AnimatedBadge>
            <AnimatedBadge variant="destructive">Error</AnimatedBadge>
            <AnimatedBadge variant="outline">Outline</AnimatedBadge>
          </PreviewCard>
          <CodeSnippet code={`<AnimatedBadge>Default</AnimatedBadge>\n<AnimatedBadge variant="positive">+12.4%</AnimatedBadge>\n<AnimatedBadge variant="negative">-3.2%</AnimatedBadge>`} />
        </div>
      </Subsection>

      <Subsection title="CountUp + Typewriter" description="Number counting and letter-by-letter text reveal.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="CountUp + Typewriter">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              <CountUp target={2400000} prefix="$" decimals={0} />
            </div>
            <p className="text-sm text-foreground/60">
              <Typewriter text="Animated text reveal for taglines and descriptions." speed={30} />
            </p>
          </PreviewCardVertical>
          <CodeSnippet code={`<CountUp target={2400000} prefix="$" decimals={0} />\n<Typewriter text="..." speed={30} />`} />
        </div>
      </Subsection>

      <Subsection title="MorphingDialog" description="Dialog that morphs from its trigger button.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="MorphingDialog">
            <MorphingDialog>
              <MorphingDialogTrigger>
                <Button variant="outline" size="sm">Open Morphing Dialog</Button>
              </MorphingDialogTrigger>
              <MorphingDialogContent title="Morphing Animation" description="This dialog morphs from the trigger button using layoutId.">
                <p className="text-sm text-foreground/60">Smooth transition powered by motion/react layout animations.</p>
              </MorphingDialogContent>
            </MorphingDialog>
          </PreviewCard>
          <CodeSnippet code={`<MorphingDialog>\n  <MorphingDialogTrigger>\n    <Button>Open</Button>\n  </MorphingDialogTrigger>\n  <MorphingDialogContent title="..." description="...">\n    ...\n  </MorphingDialogContent>\n</MorphingDialog>`} />
        </div>
      </Subsection>

      <Subsection title="AnimatedTabs" description="Tabs with animated indicator.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4">
            <AnimatedTabs defaultValue="one">
              <AnimatedTabsList>
                <AnimatedTabsTrigger value="one">Tab One</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="two">Tab Two</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="three">Tab Three</AnimatedTabsTrigger>
              </AnimatedTabsList>
              <AnimatedTabsContent value="one"><p className="text-sm text-foreground/60 p-4">Content for tab one</p></AnimatedTabsContent>
              <AnimatedTabsContent value="two"><p className="text-sm text-foreground/60 p-4">Content for tab two</p></AnimatedTabsContent>
              <AnimatedTabsContent value="three"><p className="text-sm text-foreground/60 p-4">Content for tab three</p></AnimatedTabsContent>
            </AnimatedTabs>
          </div>
          <CodeSnippet code={`<AnimatedTabs defaultValue="one">\n  <AnimatedTabsList>\n    <AnimatedTabsTrigger value="one">Tab</AnimatedTabsTrigger>\n  </AnimatedTabsList>\n  <AnimatedTabsContent value="one">...</AnimatedTabsContent>\n</AnimatedTabs>`} />
        </div>
      </Subsection>

      <Subsection title="BentoGrid" description="Flexible grid layout with variable spans.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCard title="BentoGrid">
            <BentoGrid columns={3} gap="md">
              <BentoGridItem colSpan={2}><div className="border border-foreground/10 p-4 text-sm font-mono text-foreground/60">2×1</div></BentoGridItem>
              <BentoGridItem colSpan={1}><div className="border border-foreground/10 p-4 text-sm font-mono text-foreground/60">1×1</div></BentoGridItem>
              <BentoGridItem colSpan={1}><div className="border border-foreground/10 p-4 text-sm font-mono text-foreground/60">1×1</div></BentoGridItem>
              <BentoGridItem colSpan={2}><div className="border border-foreground/10 p-4 text-sm font-mono text-foreground/60">2×1</div></BentoGridItem>
            </BentoGrid>
          </PreviewCard>
          <CodeSnippet code={`<BentoGrid columns={3} gap="md">\n  <BentoGridItem colSpan={2}>...</BentoGridItem>\n  <BentoGridItem colSpan={1}>...</BentoGridItem>\n</BentoGrid>`} />
        </div>
      </Subsection>

      <Subsection title="Marquee" description="Auto-scrolling content bar.">
        <PreviewCard title="Marquee">
          <Marquee speed={40} fadeWidth={60} className="py-2 border border-foreground/10">
            <div className="flex gap-8 text-sm text-foreground/60">
              {['React 19', 'TypeScript', 'Tailwind v4', 'motion/react', 'Radix UI', 'Next.js', 'Bun', 'Geist'].map((tech) => (
                <Badge key={tech} variant="secondary" className="font-mono text-[10px]">{tech}</Badge>
              ))}
            </div>
          </Marquee>
        </PreviewCard>
      </Subsection>

      <Subsection title="Spotlight & CursorGlow" description="Cursor-following visual effects.">
        <PreviewCard title="Spotlight">
          <Spotlight spotlightRadius={250}>
            <div className="p-6 text-sm text-center text-foreground/60 border border-foreground/5">
              Move cursor over this card
              <span className="block text-[11px] font-mono text-foreground/40 mt-1">Spotlight follows</span>
            </div>
          </Spotlight>
        </PreviewCard>
      </Subsection>

      <Subsection title="Dock" description="macOS-style dock with magnification.">
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
      </Subsection>

      <Subsection title="ParticlesBackground" description="Canvas-based particle animation.">
        <PreviewCard title="ParticlesBackground">
          <div className="relative h-32 overflow-hidden border border-foreground/10">
            <ParticlesBackground particleCount={30} color="var(--brand-dim)" speed="slow" connectDistance={120} className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-foreground/60">
              Particle canvas overlay
            </div>
          </div>
        </PreviewCard>
      </Subsection>
    </Section>
  );
}

/* ── Domain ── */
function DomainBlock({ sparkData }: { sparkData: number[] }) {
  return (
    <Section id="domain" eyebrow="09" title="Domain Components">
      <Subsection title="Callout" description="Dashed left stripe sized to the accent type (info/warn/error/success).">
        <div className="space-y-3">
          <Callout type="info" title="Heads up">Callouts use a dashed left border sized to the accent type.</Callout>
          <Callout type="warn" title="Careful">This action rotates signing keys and invalidates every active session.</Callout>
          <Callout type="error" title="Broken">The provider returned an unexpected data shape.</Callout>
          <Callout type="success" title="Nice">Your provider connected and synced successfully.</Callout>
        </div>
        <CodeSnippet code={`<Callout type="info" title="Heads up">...</Callout>\n<Callout type="warn" title="Careful">...</Callout>\n<Callout type="error" title="Broken">...</Callout>\n<Callout type="success" title="Nice">...</Callout>`} />
      </Subsection>

      <Subsection title="Metric Cards" description="Key-value metric display with status, delta, and sparkline.">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Portfolio Value" value="$2.4M" status="neutral" sparkline={sparkData} accent />
          <MetricCard label="Day P&L" value="+$12.8K" delta="+0.53%" status="positive" sparkline={sparkData.map(v => v * 1.3)} />
          <MetricCard label="VAR (95%)" value="-2.34%" delta="-0.8%" status="negative" />
          <MetricCard label="Positions" value="24" status="neutral" />
        </div>
        <CodeSnippet code={`<MetricCard label="Portfolio Value" value="$2.4M" status="neutral" sparkline={data} accent />\n<MetricCard label="Day P&L" value="+$12.8K" delta="+0.53%" status="positive" />`} />
      </Subsection>

      <Subsection title="Metric Block & Grid" description="Legacy metric display components.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewCardVertical title="Metric Block">
            <div className="flex gap-12">
              <MetricBlock label="Portfolio Value" value="$284,530" change={{ value: '+2.3%', direction: 'up' }} />
            </div>
            <div className="flex gap-12">
              <MetricBlock label="Daily P&L" value="-$1,240" change={{ value: '-0.4%', direction: 'down' }} />
            </div>
          </PreviewCardVertical>
          <PreviewCardVertical title="Metrics Grid">
            <MetricsGrid
              items={[
                { label: 'Total Value', value: '$284,530', change: { value: '+2.3%', direction: 'up' } },
                { label: 'Day Change', value: '-$1,240', change: { value: '-0.4%', direction: 'down' } },
                { label: 'Sharpe', value: '1.84', change: { value: '+0.12', direction: 'up' } },
                { label: 'VaR (95%)', value: '2.1%', change: { value: '-0.3%', direction: 'down' } },
              ]}
              columns={4}
            />
          </PreviewCardVertical>
        </div>
      </Subsection>

      <Subsection title="Delta & Status Badges" description="Financial data badges.">
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Delta Badges</p>
            <div className="flex gap-2">
              <DeltaBadge value="+2.4%" status="positive" />
              <DeltaBadge value="-1.8%" status="negative" />
              <DeltaBadge value="0.0%" status="neutral" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Status Badges</p>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status="ACTIVE" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="REVIEWING" />
              <StatusBadge status="FAILED" />
              <StatusBadge status="PENDING" />
            </div>
          </div>
        </div>
      </Subsection>

      <Subsection title="Priority & Tags" description="Workflow priority indicators and filter tags.">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Priority</p>
            <div className="flex gap-2">
              <PriorityBadge priority="HIGH" />
              <PriorityBadge priority="MEDIUM" />
              <PriorityBadge priority="LOW" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/50 mb-3">Tags</p>
            <div className="flex gap-1.5 flex-wrap">
              <TagChip label="EQUITY" active />
              <TagChip label="CRYPTO" />
              <TagChip label="ETF" />
              <TagChip label="FOREX" />
            </div>
          </div>
        </div>
      </Subsection>

      <Subsection title="Signal Gauge" description="Confidence / signal strength display.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-foreground/10 p-4">
            <SignalGauge value={72} label="CONFIDENCE" segments={40} />
          </div>
          <CodeSnippet code={`<SignalGauge value={72} label="CONFIDENCE" segments={40} />`} />
        </div>
      </Subsection>

      <Subsection title="Sparkline Bar" description="Compact inline data visualization.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex gap-4">
            <div className="border border-foreground/10 p-3">
              <SparklineBar values={sparkData} status="positive" height={24} />
            </div>
            <div className="border border-foreground/10 p-3">
              <SparklineBar values={sparkData.map(v => 1 - v)} status="negative" height={24} />
            </div>
          </div>
          <CodeSnippet code={`<SparklineBar values={data} status="positive" height={24} />\n<SparklineBar values={data} status="negative" height={24} />`} />
        </div>
      </Subsection>

      <Subsection title="Live Indicator" description="Connection status indicator.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <LiveIndicator label="LIVE" />
            <LiveIndicator label="CONNECTED" />
          </div>
          <CodeSnippet code={`<LiveIndicator label="LIVE" />\n<LiveIndicator label="CONNECTED" />`} />
        </div>
      </Subsection>

      <Subsection title="Data Freshness" description="Real-time / stale / delayed data age indicator.">
        <PreviewCard title="DataFreshnessIndicator">
          <DataFreshnessIndicator state="live" label="Real-time" />
          <DataFreshnessIndicator state="recent" label="45s ago" />
          <DataFreshnessIndicator state="stale" label="15m ago" />
          <DataFreshnessIndicator state="delayed" label="EOD" />
        </PreviewCard>
      </Subsection>

      <Subsection title="Filter Bar" description="Sortable filter chips.">
        <PreviewCardVertical title="FilterBar">
          <FilterBar
            filters={[
              { id: 'sector', label: 'Sector', options: [{ value: 'tech', label: 'Tech' }, { value: 'fin', label: 'Finance' }] },
              { id: 'region', label: 'Region', options: [{ value: 'us', label: 'US' }, { value: 'eu', label: 'EU' }] },
            ]}
            activeFilters={[]}
            onClear={() => {}}
          />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Empty State" description="Placeholder for empty data views.">
        <PreviewCardVertical title="EmptyState">
          <EmptyState
            title="No positions yet"
            description="Add your first position to start tracking your portfolio."
            action={{ label: 'Add Position', onClick: () => {} }}
          />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Signal Card" description="Contextual insight / recommendation card.">
        <PreviewCardVertical title="SignalCard">
          <SignalCard
            title="Tech Sector Overweight"
            description="Technology sector allocation at 45% — 10% above benchmark weight. Consider rebalancing toward target of 35%."
            action="reduce"
            confidence={82}
            createdAt="2025-03-15T09:30:00Z"
          />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Ticker Search" description="Symbol lookup input.">
        <PreviewCardVertical title="TickerSearch">
          <TickerSearch />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Risk Gauge" description="Semi-circular risk meter.">
        <PreviewCardVertical title="RiskGauge">
          <RiskGauge value={35} max={100} label="Portfolio Risk" />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Allocation Pie" description="Portfolio allocation visualization.">
        <PreviewCardVertical title="AllocationPie">
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
      </Subsection>

      <Subsection title="Position Table" description="Portfolio holdings table.">
        <PreviewCardVertical title="PositionTable">
          <PositionTable
            positions={[
              { id: '1', ticker: 'AAPL', name: 'Apple Inc.', quantity: 100, avgPrice: 185.50, currentPrice: 198.50, openedAt: '2025-01-15' },
              { id: '2', ticker: 'MSFT', name: 'Microsoft Corp.', quantity: 50, avgPrice: 410.20, currentPrice: 425.30, openedAt: '2025-02-01' },
              { id: '3', ticker: 'GOOGL', name: 'Alphabet Inc.', quantity: 75, avgPrice: 168.80, currentPrice: 175.20, openedAt: '2025-03-10' },
            ]}
          />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Comparison Overlay" description="Multi-ticker comparison layer.">
        <PreviewCardVertical title="ComparisonOverlay">
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
      </Subsection>

      <Subsection title="Date Range Picker" description="Calendar-based date range selector.">
        <PreviewCardVertical title="DateRangePicker">
          <DateRangePicker
            value={{ from: new Date('2025-01-01'), to: new Date('2025-03-31') }}
            onChange={() => {}}
          />
        </PreviewCardVertical>
      </Subsection>

      <Subsection title="Correlation Matrix" description="Cross-ticker correlation heatmap.">
        <PreviewCardVertical title="CorrelationMatrix">
          <CorrelationMatrix
            data={[
              { ticker: 'AAPL', correlations: { AAPL: 1, MSFT: 0.85, GOOGL: 0.72 } },
              { ticker: 'MSFT', correlations: { AAPL: 0.85, MSFT: 1, GOOGL: 0.68 } },
              { ticker: 'GOOGL', correlations: { AAPL: 0.72, MSFT: 0.68, GOOGL: 1 } },
            ]}
          />
        </PreviewCardVertical>
      </Subsection>
    </Section>
  );
}
