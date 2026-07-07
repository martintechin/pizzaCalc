import { WASTE_FACTOR } from "../config";
import type { Recipe, YeastType } from "../types";

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export interface RecipeParams {
  pizzas: number;
  ballWeightG: number;
  hydrationPct: number;
  saltPct: number;
  yeastPct: number;
  yeastType: YeastType;
}

export function buildRecipe(params: RecipeParams): Recipe {
  const totalDoughG = params.pizzas * params.ballWeightG * WASTE_FACTOR;
  const h = params.hydrationPct / 100;
  const s = params.saltPct / 100;
  const y = params.yeastPct / 100;
  const flourG = totalDoughG / (1 + h + s + y);
  return {
    flourG: roundTo(flourG, 1),
    waterG: roundTo(flourG * h, 1),
    saltG: roundTo(flourG * s, 0.1),
    yeastG: roundTo(flourG * y, 0.01),
    yeastType: params.yeastType,
    yeastPct: params.yeastPct,
    totalDoughG: roundTo(totalDoughG, 1),
  };
}
