import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-4">OpenMoney Docs</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl text-center">
        Open-source quantitative investment research and portfolio intelligence platform.
        Ingest real-time market data, quantify risk, forecast scenarios, and get actionable recommendations.
      </p>
      <div className="flex gap-4">
        <Link href="/docs/getting-started" className="inline-flex h-10 items-center justify-center rounded-md bg-foreground text-background px-6 text-sm font-medium hover:opacity-90">
          Get Started
        </Link>
        <Link href="/docs/api" className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium hover:bg-secondary">
          API Reference
        </Link>
      </div>
    </main>
  );
}
