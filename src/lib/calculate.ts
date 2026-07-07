import { SCHEDULE } from "../config";
import type { CalcInputs, CalcResult } from "../types";
import { convertYeastPct, solveIdyPct } from "./fermentation";
import { buildRecipe } from "./recipe";
import { planSchedule } from "./schedule";

export function calculate(inputs: CalcInputs, now: Date): CalcResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (inputs.cookTime.getTime() <= now.getTime()) {
    errors.push("The cook time is in the past — pick a future time.");
  }
  const mixMs = SCHEDULE.MIX_MINUTES * 60_000;
  if (inputs.cookTime.getTime() <= inputs.startTime.getTime()) {
    errors.push("The cook time must be after the start time.");
  } else if (inputs.cookTime.getTime() <= inputs.startTime.getTime() + mixMs) {
    errors.push(
      "Mixing alone takes 10–15 minutes — there's no time left to proof. Pick a later cook time."
    );
  }
  if (inputs.pizzas < 1) {
    errors.push("You need at least one pizza.");
  }
  if (errors.length > 0) {
    return { recipe: null, schedule: null, errors, warnings };
  }

  const { schedule, coldFallback } = planSchedule(inputs);

  if (coldFallback) {
    warnings.push(
      "Not enough time for a cold proof — planned a room-temperature schedule instead."
    );
  }
  if (schedule.totalHours < SCHEDULE.MIN_SENSIBLE_HOURS) {
    warnings.push(
      "Less than 4 hours until cooking — the dough may be underproofed. Consider cooking later."
    );
  }
  if (schedule.totalHours > SCHEDULE.MAX_SENSIBLE_HOURS) {
    warnings.push(
      "More than 5 days until cooking — very long fermentations are hard to predict."
    );
  }

  const { idyPct, clamped } = solveIdyPct(schedule.segments);
  if (clamped) {
    warnings.push(
      "The yeast amount hit its practical limit for this timeline — the proof may be off. Adjust your cook time if you can."
    );
  }

  const recipe = buildRecipe({
    pizzas: inputs.pizzas,
    ballWeightG: inputs.ballWeightG,
    hydrationPct: inputs.hydrationPct,
    saltPct: inputs.saltPct,
    yeastPct: convertYeastPct(idyPct, inputs.yeastType),
    yeastType: inputs.yeastType,
    roomTempC: inputs.roomTempC,
  });

  return { recipe, schedule, errors, warnings };
}
