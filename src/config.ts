import type { CalcInputs } from "./types";

export const LOCALE = {
  language: "sv-SE",
  hour12: false,
};

export const DEFAULTS: Omit<CalcInputs, "startTime" | "cookTime"> = {
  pizzas: 4,
  ballWeightG: 265,
  hydrationPct: 62,
  saltPct: 2.8,
  yeastType: "fresh",
  roomTempC: 21,
  fridgeTempC: 4,
  proofingMode: "auto",
};

/**
 * Fermentation model constants. Tune after real-world bakes.
 * The model treats fermentation as an accumulating rate process:
 * rate doubles per +TEMP_DOUBLING_C, normalized to 1.0 at REFERENCE_TEMP_C,
 * and idy% = YEAST_CONSTANT_K / effectiveHours
 * (anchor: 0.30% IDY fully proofs in 6h at 21°C → K = 1.8).
 */
export const MODEL = {
  REFERENCE_TEMP_C: 21,
  TEMP_DOUBLING_C: 7,
  YEAST_CONSTANT_K: 1.8,
  MIN_IDY_PCT: 0.01,
  MAX_IDY_PCT: 1.33,
  /** Yeast mass relative to instant dry yeast. */
  YEAST_FACTOR: { fresh: 3, activeDry: 1.25, instant: 1 },
};

/**
 * Water temperature via the desired-dough-temperature method:
 * water = 3 × target − flour temp − room temp − kneading friction,
 * with flour assumed to be at room temperature.
 */
export const WATER = {
  TARGET_DOUGH_TEMP_C: 23,
  /** Heat added by hand kneading. A spiral mixer adds ~5-9°C. */
  FRICTION_C: 1,
  MIN_C: 5,
  MAX_C: 45,
};

export const SCHEDULE = {
  /** Mixing/kneading time before fermentation starts. */
  MIX_MINUTES: 15,
  /** Auto mode plans a fridge phase above this many hours. */
  COLD_PROOF_THRESHOLD_HOURS: 12,
  /** Room-temperature bulk before the fridge. */
  COLD_BULK_HOURS: 2,
  /** Out of the fridge this long before cooking. */
  COLD_FINAL_PROOF_HOURS: 3,
  /** Ball this long before cooking in room-only mode. */
  ROOM_BALL_BEFORE_COOK_HOURS: 2,
  /** Warn below this total duration. */
  MIN_SENSIBLE_HOURS: 4,
  /** Warn above this total duration. */
  MAX_SENSIBLE_HOURS: 120,
};

/** Extra dough to account for mixing losses. */
export const WASTE_FACTOR = 1.02;
