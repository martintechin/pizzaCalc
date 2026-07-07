export type YeastType = "fresh" | "activeDry" | "instant";

export type ProofingMode = "auto" | "roomOnly" | "coldProof";

export interface CalcInputs {
  pizzas: number;
  ballWeightG: number;
  startTime: Date;
  cookTime: Date;
  hydrationPct: number;
  saltPct: number;
  yeastType: YeastType;
  roomTempC: number;
  fridgeTempC: number;
  proofingMode: ProofingMode;
}

export interface Recipe {
  flourG: number;
  waterG: number;
  waterTempC: number;
  saltG: number;
  yeastG: number;
  yeastType: YeastType;
  yeastPct: number;
  totalDoughG: number;
}

/** A stretch of fermentation at a constant temperature. */
export interface Segment {
  hours: number;
  tempC: number;
}

export interface ScheduleStep {
  label: string;
  detail: string;
  time: Date;
}

export interface Schedule {
  mode: "roomOnly" | "coldProof";
  segments: Segment[];
  steps: ScheduleStep[];
  totalHours: number;
}

export interface CalcResult {
  recipe: Recipe | null;
  schedule: Schedule | null;
  errors: string[];
  warnings: string[];
}
