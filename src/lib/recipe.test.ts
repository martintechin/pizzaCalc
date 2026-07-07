import { describe, expect, it } from "vitest";
import { buildRecipe } from "./recipe";

const base = {
  pizzas: 4,
  ballWeightG: 265,
  hydrationPct: 62,
  saltPct: 2.8,
  yeastPct: 0.3,
  yeastType: "fresh" as const,
};

describe("buildRecipe", () => {
  it("includes a 2% waste factor in the total dough", () => {
    const recipe = buildRecipe(base);
    expect(recipe.totalDoughG).toBeCloseTo(4 * 265 * 1.02, 0);
  });

  it("balances mass: ingredients sum to the total dough", () => {
    const recipe = buildRecipe(base);
    const sum = recipe.flourG + recipe.waterG + recipe.saltG + recipe.yeastG;
    expect(sum).toBeCloseTo(recipe.totalDoughG, -1);
  });

  it("respects baker's percentages", () => {
    const recipe = buildRecipe(base);
    expect(recipe.waterG / recipe.flourG).toBeCloseTo(0.62, 2);
    expect(recipe.saltG / recipe.flourG).toBeCloseTo(0.028, 3);
    expect(recipe.yeastG / recipe.flourG).toBeCloseTo(0.003, 3);
  });

  it("rounds flour/water to 1g, salt to 0.1g, yeast to 0.01g", () => {
    const recipe = buildRecipe(base);
    expect(recipe.flourG % 1).toBe(0);
    expect(recipe.waterG % 1).toBe(0);
    expect(Math.round(recipe.saltG * 10)).toBeCloseTo(recipe.saltG * 10, 5);
    expect(Math.round(recipe.yeastG * 100)).toBeCloseTo(recipe.yeastG * 100, 5);
  });

  it("scales linearly with pizza count", () => {
    const single = buildRecipe({ ...base, pizzas: 1 });
    const quad = buildRecipe({ ...base, pizzas: 4 });
    expect(quad.flourG).toBeCloseTo(single.flourG * 4, -1);
  });
});
