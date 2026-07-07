import { SCHEDULE } from "../config";
import type { ProofingMode, Schedule, ScheduleStep, Segment } from "../types";

const MS_PER_HOUR = 3_600_000;

export interface ScheduleParams {
  startTime: Date;
  cookTime: Date;
  roomTempC: number;
  fridgeTempC: number;
  proofingMode: ProofingMode;
}

export interface ScheduleResult {
  schedule: Schedule;
  /** Set when a forced cold proof did not fit and fell back to room-only. */
  coldFallback: boolean;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR);
}

const MIX_DETAIL =
  "Dissolve yeast in the water, add flour, then salt. Knead until smooth — allow 10–15 minutes.";

function buildRoomOnly(
  params: ScheduleParams,
  fermentStart: Date,
  totalHours: number
): Schedule {
  const { startTime, cookTime, roomTempC } = params;
  const ballHours = Math.max(
    totalHours - SCHEDULE.ROOM_BALL_BEFORE_COOK_HOURS,
    totalHours / 2
  );
  const ballTime = addHours(fermentStart, ballHours);
  const segments: Segment[] = [{ hours: totalHours, tempC: roomTempC }];
  const steps: ScheduleStep[] = [
    {
      label: "Mix the dough",
      detail: MIX_DETAIL,
      time: startTime,
    },
    {
      label: "Bulk proof",
      detail: `Cover and leave at room temperature (${params.roomTempC}°C).`,
      time: fermentStart,
    },
    {
      label: "Ball the dough",
      detail: "Divide into balls and proof covered until cooking.",
      time: ballTime,
    },
    {
      label: "Fire it up",
      detail: "Stretch, top and bake.",
      time: cookTime,
    },
  ];
  return { mode: "roomOnly", segments, steps, totalHours };
}

function buildColdProof(
  params: ScheduleParams,
  fermentStart: Date,
  totalHours: number
): Schedule {
  const { startTime, cookTime, roomTempC, fridgeTempC } = params;
  const coldHours =
    totalHours - SCHEDULE.COLD_BULK_HOURS - SCHEDULE.COLD_FINAL_PROOF_HOURS;
  const ballTime = addHours(fermentStart, SCHEDULE.COLD_BULK_HOURS);
  const outTime = addHours(cookTime, -SCHEDULE.COLD_FINAL_PROOF_HOURS);
  const segments: Segment[] = [
    { hours: SCHEDULE.COLD_BULK_HOURS, tempC: roomTempC },
    { hours: coldHours, tempC: fridgeTempC },
    { hours: SCHEDULE.COLD_FINAL_PROOF_HOURS, tempC: roomTempC },
  ];
  const steps: ScheduleStep[] = [
    {
      label: "Mix the dough",
      detail: MIX_DETAIL,
      time: startTime,
    },
    {
      label: "Bulk proof",
      detail: `Cover and leave at room temperature (${roomTempC}°C).`,
      time: fermentStart,
    },
    {
      label: "Ball & into the fridge",
      detail: `Divide into balls, cover, and refrigerate (${fridgeTempC}°C).`,
      time: ballTime,
    },
    {
      label: "Out of the fridge",
      detail: "Let the balls come back to room temperature, covered.",
      time: outTime,
    },
    {
      label: "Fire it up",
      detail: "Stretch, top and bake.",
      time: cookTime,
    },
  ];
  return { mode: "coldProof", segments, steps, totalHours };
}

export function planSchedule(params: ScheduleParams): ScheduleResult {
  // Fermentation only starts once mixing is done.
  const fermentStart = addHours(params.startTime, SCHEDULE.MIX_MINUTES / 60);
  const totalHours =
    (params.cookTime.getTime() - fermentStart.getTime()) / MS_PER_HOUR;

  const minColdTotal =
    SCHEDULE.COLD_BULK_HOURS + SCHEDULE.COLD_FINAL_PROOF_HOURS + 1;

  let wantCold: boolean;
  switch (params.proofingMode) {
    case "roomOnly":
      wantCold = false;
      break;
    case "coldProof":
      wantCold = true;
      break;
    case "auto":
      wantCold = totalHours > SCHEDULE.COLD_PROOF_THRESHOLD_HOURS;
      break;
  }

  if (wantCold && totalHours < minColdTotal) {
    return {
      schedule: buildRoomOnly(params, fermentStart, totalHours),
      coldFallback: true,
    };
  }
  return {
    schedule: wantCold
      ? buildColdProof(params, fermentStart, totalHours)
      : buildRoomOnly(params, fermentStart, totalHours),
    coldFallback: false,
  };
}
