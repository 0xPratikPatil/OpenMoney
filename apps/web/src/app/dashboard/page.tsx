export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
      <p className="mt-2 text-[var(--text-secondary)]">Your portfolio overview and recent activity.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">--</p>
        </div>
        <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-[var(--text-secondary)]">Day P&L</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">--</p>
        </div>
        <div className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-[var(--text-secondary)]">Portfolio VaR (95%)</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">--</p>
        </div>
      </div>
    </div>
  );
}
