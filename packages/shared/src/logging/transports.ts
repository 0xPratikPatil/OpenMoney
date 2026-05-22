/**
 * Built-in log transports.
 */

import type { LogEntry, LogTransport } from "./types";

/* -------------------------------------------------------------------------- */
/*  Console Transport                                                          */
/* -------------------------------------------------------------------------- */

const LEVEL_CONSOLE_METHOD: Record<string, "log" | "info" | "warn" | "error"> = {
  trace: "log",
  debug: "log",
  info: "info",
  warn: "warn",
  error: "error",
  critical: "error",
};

const LEVEL_COLOR: Record<string, string> = {
  trace: "\x1b[90m",
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  critical: "\x1b[35m",
};
const RESET = "\x1b[0m";

export class ConsoleTransport implements LogTransport {
  constructor(
    private readonly options: { color?: boolean; pretty?: boolean } = {},
  ) {}

  write(entry: LogEntry): void {
    const useColor = this.options.color !== false;
    const usePretty = this.options.pretty !== false;

    if (usePretty) {
      const ts = entry.timestamp.slice(11, 23); // HH:MM:SS.mmm
      const color = useColor ? (LEVEL_COLOR[entry.level] ?? "") : "";
      const rid = entry.meta?.requestId ? ` [${entry.meta.requestId}]` : "";
      const meta = this.formatMeta(entry.meta);

      const method = LEVEL_CONSOLE_METHOD[entry.level] ?? "log";
      console[method](
        `${color}[${ts}] ${entry.level.toUpperCase().padEnd(5)}${RESET} ${entry.app}${rid} ${entry.message}${meta}`,
      );
    } else {
      // Structured JSON for log aggregators
      console.log(JSON.stringify(entry));
    }
  }

  private formatMeta(meta?: Record<string, unknown>): string {
    if (!meta) return "";
    const parts: string[] = [];
    for (const [k, v] of Object.entries(meta)) {
      if (k === "requestId" || k === "duration" || v === undefined) continue;
      parts.push(`${k}=${JSON.stringify(v)}`);
    }
    return parts.length > 0 ? ` ${parts.join(" ")}` : "";
  }
}

/* -------------------------------------------------------------------------- */
/*  Memory Transport (for testing / buffering)                                 */
/* -------------------------------------------------------------------------- */

export class MemoryTransport implements LogTransport {
  entries: LogEntry[] = [];

  write(entry: LogEntry): void {
    this.entries.push(entry);
  }

  clear(): void {
    this.entries = [];
  }

  /** Get entries filtered by level */
  filter(level: string): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }
}

/* -------------------------------------------------------------------------- */
/*  HTTP Transport (for remote log aggregation)                                */
/* -------------------------------------------------------------------------- */

export class HttpTransport implements LogTransport {
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly endpoint: string,
    private readonly options: {
      batchSize?: number;
      flushIntervalMs?: number;
      headers?: Record<string, string>;
    } = {},
  ) {
    if (typeof setInterval !== "undefined") {
      this.flushTimer = setInterval(
        () => this.flush(),
        options.flushIntervalMs ?? 5000,
      );
    }
  }

  write(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= (this.options.batchSize ?? 50)) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.options.headers,
        },
        body: JSON.stringify({ entries: batch }),
      });
    } catch {
      // Silently drop — log aggregation is best-effort
    }
  }

  destroy(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }
}
