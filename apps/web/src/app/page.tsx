import Link from 'next/link';
import { Bot, TrendingUp, ShieldAlert, BarChart3, Zap, ArrowRight, Globe, Activity, Sparkles, Layers } from 'lucide-react';

const features = [
  { icon: Bot, title: 'AI Agent Analysis', description: '37 investor agents analyze every ticker from their unique philosophy. Get multi-perspective consensus with detailed reasoning.' },
  { icon: ShieldAlert, title: 'Institutional Risk Analytics', description: 'VaR, CVaR, Sharpe, Sortino, drawdown, correlation matrices, and position-level risk decomposition.' },
  { icon: BarChart3, title: 'Real-Time Market Data', description: '33 data providers across equities, ETFs, forex, crypto, and economic data. Multi-source fallback ensures reliability.' },
  { icon: TrendingUp, title: 'Portfolio Intelligence', description: 'Track positions, cost basis, P&L enriched with live market data. Get actionable hold/add/reduce/exit recommendations.' },
  { icon: BookOpenIcon, title: 'Prediction Journal', description: 'Log investment theses with confidence levels. Track prediction accuracy with calibration curves and Brier scores.' },
  { icon: Globe, title: 'Programmatic Access', description: 'Full REST API + WebSocket streaming. TypeScript-native, open-source. Extend with custom providers and quant models.' },
];

function BookOpenIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>; }

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--brand)]/15">
              <Zap size={14} className="text-[var(--brand)]" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-[var(--text-primary)]">OpenMoney</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/docs" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Docs</a>
            <a href="/docs" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">API</a>
            <Link href="/auth/login" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">Sign in</Link>
            <Link href="/auth/register" className="text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-1)] mb-8">
              <Sparkles size={12} className="text-[var(--brand)]" />
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">AI-Native Financial Intelligence Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.05]">
              Financial intelligence,<br />
              <span className="text-[var(--brand)]">amplified by AI.</span>
            </h1>
            <p className="mt-6 text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              Track portfolios in real-time. Quantify risk with institutional metrics. Run multi-agent AI analysis. Log investment theses and measure your prediction accuracy — all in one platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity">
                Start free <ArrowRight size={14} />
              </Link>
              <a href="/docs" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-1)] transition-colors">
                <Activity size={14} /> View docs
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-[var(--border-subtle)] pt-12">
            {[{ value: '33', label: 'Data Providers' }, { value: '37', label: 'AI Agents' }, { value: '∞', label: 'Free & Open Source' }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{s.value}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-16 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-1 overflow-hidden shadow-2xl">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[var(--negative)]/70" />
                <div className="w-3 h-3 rounded-full bg-[var(--warning)]/70" />
                <div className="w-3 h-3 rounded-full bg-[var(--positive)]/70" />
                <span className="ml-3 font-mono text-[11px] text-[var(--text-tertiary)]">OpenMoney Terminal — v0.0.1</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'PORTFOLIO VALUE', value: '$142,391.27', color: '' },
                  { label: 'DAY P&L', value: '+$1,234.56', color: 'text-[var(--positive)]' },
                  { label: 'VaR (95%)', value: '-2.34%', color: 'text-[var(--negative)]' },
                  { label: 'SHARPE', value: '1.42', color: 'text-[var(--text-primary)]' },
                ].map(m => (
                  <div key={m.label} className="rounded-md bg-[var(--surface-1)] p-3 border border-[var(--border-subtle)]">
                    <p className="font-mono text-[8px] text-[var(--text-tertiary)]">{m.label}</p>
                    <p className={`mt-1 font-mono text-lg font-bold tabular-nums ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-md bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
                <div className="w-full h-full px-4 py-3">
                  <svg viewBox="0 0 300 68" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,50 Q15,45 30,48 T60,40 T90,35 T120,30 T150,22 T180,18 T210,25 T240,15 T270,20 T300,10" fill="none" stroke="var(--positive)" strokeWidth="1.5" />
                    <path d="M0,68 L0,50 Q15,45 30,48 T60,40 T90,35 T120,30 T150,22 T180,18 T210,25 T240,15 T270,20 T300,10 L300,68 Z" fill="url(#heroChartGrad)" opacity="0.3" />
                    <defs><linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--positive)" stopOpacity="0.8" /><stop offset="100%" stopColor="var(--positive)" stopOpacity="0" /></linearGradient></defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Everything you need to invest smarter</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Built for analysts, quants, and serious investors who demand institutional-grade tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="group rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 hover:border-[var(--border-strong)] transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--brand)]/10 mb-4 group-hover:bg-[var(--brand)]/20 transition-colors">
                  <f.icon size={18} className="text-[var(--brand)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{f.title}</h3>
                <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--brand)]/15 mx-auto mb-5">
              <Layers size={20} className="text-[var(--brand)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ready to upgrade your investment workflow?</h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-md mx-auto">Open-source. Self-hostable. Institutional-grade. Start building your edge today.</p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity"><Zap size={14} /> Launch terminal</Link>
              <a href="https://github.com/0xPratikPatil/OpenMoney" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-2)] transition-colors"><ArrowRight size={14} /> Star on GitHub</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-0)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-[var(--brand)]" />
            <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">OpenMoney</span>
          </div>
          <p className="font-mono text-[10px] text-[var(--text-tertiary)]">Open-source quantitative finance platform · AGPL-3.0</p>
        </div>
      </footer>
    </div>
  );
}
