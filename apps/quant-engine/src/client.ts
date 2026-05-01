import type { QuantRequest, QuantResponse } from '@openmoney/shared/types';

export class QuantClient {
  private url: string;
  private timeout: number;

  constructor(url: string, timeout = 30_000) {
    this.url = url;
    this.timeout = timeout;
  }

  async compute(type: QuantRequest['type'], payload: Record<string, unknown>): Promise<QuantResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.url}/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, data: {}, error: `HTTP ${res.status}: ${text}`, computedAt: new Date().toISOString() };
      }

      return await res.json() as QuantResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, data: {}, error: message, computedAt: new Date().toISOString() };
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/health`, { signal: AbortSignal.timeout(5000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}
