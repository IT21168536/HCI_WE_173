import { formatShortDateTime } from '@/shared/utils/dateUtils';

export type TimeSlot = { value: string | null; label: string };

/**
 * "As soon as possible" plus a few pre-order slots: the next two half-hour
 * slots at least 90 minutes away today, and lunch/dinner tomorrow.
 */
export function buildTimeSlots(now = new Date()): TimeSlot[] {
  const slots: TimeSlot[] = [{ value: null, label: 'As soon as possible' }];

  const start = new Date(now.getTime() + 90 * 60_000);
  start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
  for (let i = 0; i < 2; i += 1) {
    const slot = new Date(start.getTime() + i * 60 * 60_000);
    if (slot.getDate() === now.getDate() && slot.getHours() <= 21) {
      slots.push({ value: slot.toISOString(), label: formatShortDateTime(slot.toISOString()) });
    }
  }

  for (const hour of [12, 19]) {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, hour === 12 ? 30 : 0);
    slots.push({ value: tomorrow.toISOString(), label: formatShortDateTime(tomorrow.toISOString()) });
  }

  return slots;
}
