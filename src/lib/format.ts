import { LOCALE } from "../config";

/** e.g. "tis 18:00" or "tis 8 juli 18:00" when the date is far away. */
export function formatStepTime(date: Date, reference: Date): string {
  const sameDay = date.toDateString() === reference.toDateString();
  const dayMs = 86_400_000;
  const withinWeek =
    Math.abs(date.getTime() - reference.getTime()) < 6 * dayMs;
  const time = date.toLocaleTimeString(LOCALE.language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: LOCALE.hour12,
  });
  if (sameDay) {
    return time;
  }
  if (withinWeek) {
    const weekday = date.toLocaleDateString(LOCALE.language, {
      weekday: "short",
    });
    return `${weekday} ${time}`;
  }
  const day = date.toLocaleDateString(LOCALE.language, {
    day: "numeric",
    month: "short",
  });
  return `${day} ${time}`;
}

/** e.g. "26 h" or "3,5 h" */
export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 2) / 2;
  return `${rounded.toLocaleString(LOCALE.language)} h`;
}

/** Date → value for <input type="datetime-local"> in local time. */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** <input type="datetime-local"> value → Date (local time). Null if empty/invalid. */
export function fromDatetimeLocal(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Grams with sensible precision: 1 decimal under 10 g, 2 under 1 g. */
export function formatGrams(grams: number): string {
  const decimals = grams < 1 ? 2 : grams < 10 ? 1 : 0;
  return `${grams.toLocaleString(LOCALE.language, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} g`;
}
