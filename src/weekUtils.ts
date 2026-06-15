import { startOfISOWeek, addWeeks, format, getISOWeek, getISOWeekYear, parseISO, differenceInWeeks } from 'date-fns';

export function currentWeekKey(): string {
  return dateToWeekKey(new Date());
}

export function dateToWeekKey(d: Date): string {
  const y = getISOWeekYear(d);
  const w = getISOWeek(d);
  return `${y}-W${String(w).padStart(2, '0')}`;
}

export function weekKeyToDate(key: string): Date {
  const [yearStr, weekStr] = key.split('-W');
  const jan4 = new Date(Number(yearStr), 0, 4);
  const start = startOfISOWeek(jan4);
  return addWeeks(start, Number(weekStr) - 1);
}

export function offsetWeek(key: string, offset: number): string {
  const d = weekKeyToDate(key);
  return dateToWeekKey(addWeeks(d, offset));
}

export function weekLabel(key: string): string {
  const d = weekKeyToDate(key);
  const end = addWeeks(d, 1);
  return `${format(d, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function weeksRemaining(endDate: string): number {
  const end = parseISO(endDate);
  const now = new Date();
  return Math.max(0, differenceInWeeks(end, now));
}
