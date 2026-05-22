/**
 * Logging Types
 */

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "critical";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  app: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface LogTransport {
  write(entry: LogEntry): void;
  /** Optional: flush pending writes */
  flush?(): Promise<void>;
}
