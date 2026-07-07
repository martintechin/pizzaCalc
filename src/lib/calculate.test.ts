import { describe, expect, it } from "vitest";
import { DEFAULTS } from "../config";
import type { CalcInputs } from "../types";
import { calculate } from "./calculate";

const MS_PER_HOUR = 3_600_000;
const now = new Date("2026-07-07T10:00:00");

function inputs(totalHours: number, overrides: Partial<CalcInputs> = {}): CalcInputs {
  return {
    ...DEFAULTS,
    startTime: now,
    cookTime: new Date(now.getTime() + totalHours * MS_PER_HOUR),
    ...overrides,
  };
}

describe("calculate — errors", () => {
  it("rejects a cook time in the past", () => {
    const result = calculate(inputs(-2), now);
    expect(result.recipe).toBeNull();
    expect(result.schedule).toBeNull();
    expect(result.errors.some((e) => e.includes("past"))).toBe(true);
  });

  it("rejects cook time before start time", () => {
    const result = calculate(
      inputs(5, { startTime: new Date(now.getTime() + 10 * MS_PER_HOUR) }),
      now
    );
    expect(result.recipe).toBeNull();
    expect(result.errors.some((e) => e.includes("after the start"))).toBe(true);
  });

  it("rejects zero pizzas", () => {
    const result = calculate(inputs(8, { pizzas: 0 }), now);
    expect(result.recipe).toBeNull();
  });
});

describe("calculate — warnings", () => {
  it("warns on very short timelines", () => {
    const result = calculate(inputs(2), now);
    expect(result.recipe).not.toBeNull();
    expect(result.warnings.some((w) => w.includes("underproofed"))).toBe(true);
  });

  it("warns on very long timelines", () => {
    const result = calculate(inputs(150), now);
    expect(result.warnings.some((w) => w.includes("5 days"))).toBe(true);
  });

  it("warns when a forced cold proof falls back to room temperature", () => {
    const result = calculate(inputs(4, { proofingMode: "coldProof" }), now);
    expect(result.schedule?.mode).toBe("roomOnly");
    expect(result.warnings.some((w) => w.includes("Not enough time"))).toBe(true);
  });

  it("warns when the yeast amount is clamped", () => {
    const result = calculate(inputs(1), now);
    expect(result.warnings.some((w) => w.includes("practical limit"))).toBe(true);
  });

  it("has no warnings for a comfortable 24h plan", () => {
    const result = calculate(inputs(24), now);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("calculate — results", () => {
  it("produces a complete recipe and schedule for a 24h plan", () => {
    const { recipe, schedule } = calculate(inputs(24), now);
    expect(recipe).not.toBeNull();
    expect(schedule?.mode).toBe("coldProof");
    expect(recipe!.flourG).toBeGreaterThan(0);
    expect(recipe!.yeastG).toBeGreaterThan(0);
  });

  it("uses more yeast for a 6h plan than a 24h plan", () => {
    const short = calculate(inputs(6), now).recipe!;
    const long = calculate(inputs(24), now).recipe!;
    expect(short.yeastPct).toBeGreaterThan(long.yeastPct);
  });

  it("converts yeast quantity by type (fresh = 3× instant)", () => {
    const fresh = calculate(inputs(24, { yeastType: "fresh" }), now).recipe!;
    const instant = calculate(inputs(24, { yeastType: "instant" }), now).recipe!;
    expect(fresh.yeastPct / instant.yeastPct).toBeCloseTo(3, 3);
  });
});
