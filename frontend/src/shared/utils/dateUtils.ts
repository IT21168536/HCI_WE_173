const MINUTE = 60_000;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDayLabel(value: string | Date) {
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "Today, 7:40 PM", "Tomorrow, 12:30 PM", "Sat 3 Oct, 9:00 AM" */
export function formatShortDateTime(value?: string | null) {
  if (!value) {
    return 'As soon as possible';
  }
  return `${formatDayLabel(value)}, ${formatTime(value)}`;
}

/** "Just now", "5 min ago", "2 h ago", or the day label. */
export function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < MINUTE) return 'Just now';
  if (diff < 60 * MINUTE) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < 12 * 60 * MINUTE) return `${Math.floor(diff / (60 * MINUTE))} h ago`;
  return formatDayLabel(value);
}

export function isFuture(value?: string | null) {
  return Boolean(value && new Date(value).getTime() > Date.now());
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
