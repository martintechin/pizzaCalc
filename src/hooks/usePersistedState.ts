import { useEffect, useState } from "react";

/** useState backed by localStorage. Only use for JSON-serializable values. */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupt entry — fall through to the default.
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — persistence is best-effort.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
