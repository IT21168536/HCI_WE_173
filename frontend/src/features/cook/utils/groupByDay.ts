import { formatDayLabel } from '@/shared/utils/dateUtils';

/** Groups items into [{ label: 'Tomorrow', items }] keeping the input order. */
export function groupByDay<T>(items: T[], dateOf: (item: T) => string | null | undefined) {
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const value = dateOf(item);
    const label = value ? formatDayLabel(value) : 'No date';
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}
