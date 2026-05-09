import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>OpenMoney Docs</h1>
      <p style={{ color: "#666", marginBottom: "2rem", maxWidth: "600px" }}>
        Open-source quantitative investment research and portfolio intelligence platform.
        Ingest real-time market data, quantify risk, forecast scenarios, and get actionable recommendations.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <a href="/docs/getting-started" style={{ padding: "0.5rem 1.5rem", background: "#1a1a1a", color: "white", borderRadius: "6px", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem" }}>
          Get Started
        </a>
        <a href="/docs/api" style={{ padding: "0.5rem 1.5rem", border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem", color: "#333" }}>
          API Reference
        </a>
      </div>
    </main>
  );
}
