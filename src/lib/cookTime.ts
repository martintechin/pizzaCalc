const MS_PER_DAY = 86_400_000;

/** Fallback when nothing is stored: tomorrow at 18:00. */
export function defaultCookTime(now: Date): Date {
  const cook = new Date(now);
  cook.setDate(cook.getDate() + 1);
  cook.setHours(18, 0, 0, 0);
  return cook;
}

/**
 * Restore a remembered cook time. A stored time still in the future is used
 * as-is; one that has passed rolls forward to the next day at the same
 * clock time, so returning to the app never starts from a past-time error.
 */
export function restoreCookTime(storedIso: string | null, now: Date): Date {
  if (!storedIso) return defaultCookTime(now);
  const stored = new Date(storedIso);
  if (Number.isNaN(stored.getTime())) return defaultCookTime(now);
  if (stored.getTime() > now.getTime()) return stored;

  const candidate = new Date(now);
  candidate.setHours(
    stored.getHours(),
    stored.getMinutes(),
    stored.getSeconds(),
    0
  );
  while (candidate.getTime() <= now.getTime()) {
    candidate.setTime(candidate.getTime() + MS_PER_DAY);
  }
  return candidate;
}
