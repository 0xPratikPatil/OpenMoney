/** Market calendar and date utilities */

/** US market timezone */
const MARKET_TZ = 'America/New_York';

/** Market open: 9:30 AM ET */
export function isMarketOpen(date: Date = new Date()): boolean {
  const et = date.toLocaleString('en-US', { timeZone: MARKET_TZ });
  const etDate = new Date(et);
  const day = etDate.getDay();
  const hour = etDate.getHours();
  const minutes = etDate.getMinutes();
  const totalMinutes = hour * 60 + minutes;

  // Weekends
  if (day === 0 || day === 6) return false;

  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60;    // 4:00 PM

  return totalMinutes >= marketOpen && totalMinutes < marketClose;
}

/** Get the number of trading days between two dates (approximate) */
export function tradingDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Format an ISO datetime string for display */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/** Format a date for display */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
