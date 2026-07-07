import { MODEL } from "../config";
import type { Segment, YeastType } from "../types";

/** Fermentation rate at a temperature, relative to the reference temp. */
export function tempRate(tempC: number): number {
  return 2 ** ((tempC - MODEL.REFERENCE_TEMP_C) / MODEL.TEMP_DOUBLING_C);
}

/** Duration of the schedule expressed as hours at the reference temperature. */
export function effectiveHours(segments: Segment[]): number {
  return segments.reduce((sum, seg) => sum + tempRate(seg.tempC) * seg.hours, 0);
}

export interface YeastResult {
  idyPct: number;
  clamped: boolean;
}

/** Instant-dry-yeast baker's % needed to fully proof over the given segments. */
export function solveIdyPct(segments: Segment[]): YeastResult {
  const hours = effectiveHours(segments);
  if (hours <= 0) {
    return { idyPct: MODEL.MAX_IDY_PCT, clamped: true };
  }
  const raw = MODEL.YEAST_CONSTANT_K / hours;
  const idyPct = Math.min(MODEL.MAX_IDY_PCT, Math.max(MODEL.MIN_IDY_PCT, raw));
  return { idyPct, clamped: idyPct !== raw };
}

/** Convert an IDY baker's % to the equivalent % for another yeast type. */
export function convertYeastPct(idyPct: number, type: YeastType): number {
  return idyPct * MODEL.YEAST_FACTOR[type];
}
