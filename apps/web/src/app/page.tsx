import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">OpenMoney</span>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm px-4 py-2 bg-primary-600 hover:bg-primary-700 text-primary-foreground rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Investment research.{' '}
            <span className="text-primary-500">Quantified.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Track your portfolio in real-time. Quantify risk with institutional-grade metrics.
            Get actionable recommendations. Log your investment theses and measure your prediction accuracy.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              Start tracking &mdash; free
            </Link>
            <a
              href="/docs"
              className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-muted rounded-xl border border-border"
            >
              <div className="text-2xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    icon: '\u{1F4CA}',
    title: 'Real-time Portfolio',
    description: 'Track positions, cost basis, and P&L enriched with live market data from multiple sources.',
  },
  {
    icon: '\u26A0\uFE0F',
    title: 'Risk Analytics',
    description: 'VaR, Sharpe ratio, drawdowns, correlation matrices, and position-level risk decomposition.',
  },
  {
    icon: '\u{1F3AF}',
    title: 'Action Recommendations',
    description: 'Data-driven hold/add/reduce/exit signals with clear explanations for each decision.',
  },
  {
    icon: '\u{1F4DD}',
    title: 'Investment Journal',
    description: 'Log theses, track predictions with confidence scores, and measure your calibration over time.',
  },
  {
    icon: '\u{1F52E}',
    title: 'Forecasting',
    description: 'ARIMA, GARCH, and Monte Carlo simulations for price and volatility forecasting.',
  },
  {
    icon: '\u{1F50C}',
    title: 'API-First',
    description: 'Full REST API and WebSocket support. Extend and integrate with your own tools.',
  },
];
