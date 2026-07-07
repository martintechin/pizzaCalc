import { describe, expect, it } from "vitest";
import { convertYeastPct, effectiveHours, solveIdyPct, tempRate } from "./fermentation";

describe("tempRate", () => {
  it("is 1.0 at the reference temperature (21°C)", () => {
    expect(tempRate(21)).toBeCloseTo(1.0, 5);
  });

  it("doubles per +7°C", () => {
    expect(tempRate(28)).toBeCloseTo(2.0, 5);
    expect(tempRate(14)).toBeCloseTo(0.5, 5);
  });

  it("slows to ~0.186 at fridge temperature (4°C)", () => {
    expect(tempRate(4)).toBeCloseTo(0.186, 2);
  });
});

describe("effectiveHours", () => {
  it("sums duration × rate over segments", () => {
    expect(effectiveHours([{ hours: 6, tempC: 21 }])).toBeCloseTo(6, 5);
    expect(
      effectiveHours([
        { hours: 2, tempC: 21 },
        { hours: 2, tempC: 28 },
      ])
    ).toBeCloseTo(2 + 4, 5);
  });

  it("is zero for no segments", () => {
    expect(effectiveHours([])).toBe(0);
  });
});

describe("solveIdyPct", () => {
  it("matches the anchor: 6h at 21°C → 0.30% IDY", () => {
    const { idyPct, clamped } = solveIdyPct([{ hours: 6, tempC: 21 }]);
    expect(idyPct).toBeCloseTo(0.3, 5);
    expect(clamped).toBe(false);
  });

  it("gives 0.075% for 24h at 21°C", () => {
    const { idyPct } = solveIdyPct([{ hours: 24, tempC: 21 }]);
    expect(idyPct).toBeCloseTo(0.075, 5);
  });

  it("gives ~0.207% for a typical cold-proof day (2h RT + 20h fridge + 3h RT)", () => {
    const { idyPct } = solveIdyPct([
      { hours: 2, tempC: 21 },
      { hours: 20, tempC: 4 },
      { hours: 3, tempC: 21 },
    ]);
    expect(idyPct).toBeCloseTo(0.207, 2);
  });

  it("needs less yeast the more time there is", () => {
    const short = solveIdyPct([{ hours: 5, tempC: 21 }]).idyPct;
    const long = solveIdyPct([{ hours: 30, tempC: 21 }]).idyPct;
    expect(long).toBeLessThan(short);
  });

  it("clamps very short timelines to the max and flags it", () => {
    const { idyPct, clamped } = solveIdyPct([{ hours: 0.5, tempC: 21 }]);
    expect(idyPct).toBe(1.33);
    expect(clamped).toBe(true);
  });

  it("clamps very long timelines to the min and flags it", () => {
    const { idyPct, clamped } = solveIdyPct([{ hours: 500, tempC: 21 }]);
    expect(idyPct).toBe(0.01);
    expect(clamped).toBe(true);
  });

  it("clamps zero-duration schedules", () => {
    const { idyPct, clamped } = solveIdyPct([]);
    expect(idyPct).toBe(1.33);
    expect(clamped).toBe(true);
  });
});

describe("convertYeastPct", () => {
  it("converts IDY to fresh (3×), active dry (1.25×), instant (1×)", () => {
    expect(convertYeastPct(0.1, "fresh")).toBeCloseTo(0.3, 5);
    expect(convertYeastPct(0.1, "activeDry")).toBeCloseTo(0.125, 5);
    expect(convertYeastPct(0.1, "instant")).toBeCloseTo(0.1, 5);
  });
});
