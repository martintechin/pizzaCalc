import { describe, expect, it } from "vitest";
import { planSchedule, type ScheduleParams } from "./schedule";

const MS_PER_HOUR = 3_600_000;
const start = new Date("2026-07-07T10:00:00");

function params(totalHours: number, overrides: Partial<ScheduleParams> = {}): ScheduleParams {
  return {
    startTime: start,
    cookTime: new Date(start.getTime() + totalHours * MS_PER_HOUR),
    roomTempC: 21,
    fridgeTempC: 4,
    proofingMode: "auto",
    ...overrides,
  };
}

describe("planSchedule — auto mode", () => {
  it("picks room-only at 12h or less", () => {
    expect(planSchedule(params(8)).schedule.mode).toBe("roomOnly");
    expect(planSchedule(params(12)).schedule.mode).toBe("roomOnly");
  });

  it("picks cold proof above 12h", () => {
    expect(planSchedule(params(13)).schedule.mode).toBe("coldProof");
    expect(planSchedule(params(26)).schedule.mode).toBe("coldProof");
  });
});

describe("planSchedule — overrides", () => {
  it("roomOnly override keeps room temp even for long timelines", () => {
    const { schedule } = planSchedule(params(24, { proofingMode: "roomOnly" }));
    expect(schedule.mode).toBe("roomOnly");
    expect(schedule.segments).toHaveLength(1);
  });

  it("coldProof override uses the fridge even for short-ish timelines", () => {
    const { schedule, coldFallback } = planSchedule(
      params(8, { proofingMode: "coldProof" })
    );
    expect(schedule.mode).toBe("coldProof");
    expect(coldFallback).toBe(false);
  });

  it("falls back to room-only when a forced cold proof does not fit", () => {
    const { schedule, coldFallback } = planSchedule(
      params(4, { proofingMode: "coldProof" })
    );
    expect(schedule.mode).toBe("roomOnly");
    expect(coldFallback).toBe(true);
  });
});

describe("planSchedule — segments", () => {
  // Fermentation starts 15 min after the start time (mixing allowance).
  const MIX_H = 0.25;

  it("room-only has one segment covering the post-mix duration at room temp", () => {
    const { schedule } = planSchedule(params(8));
    expect(schedule.segments).toEqual([{ hours: 8 - MIX_H, tempC: 21 }]);
  });

  it("cold proof is 2h RT + fridge + 3h RT and sums to the post-mix total", () => {
    const { schedule } = planSchedule(params(26));
    expect(schedule.segments).toEqual([
      { hours: 2, tempC: 21 },
      { hours: 21 - MIX_H, tempC: 4 },
      { hours: 3, tempC: 21 },
    ]);
    const sum = schedule.segments.reduce((acc, s) => acc + s.hours, 0);
    expect(sum).toBeCloseTo(26 - MIX_H, 5);
  });
});

describe("planSchedule — steps", () => {
  it("steps are in chronological order and start/end at start/cook time", () => {
    for (const p of [params(8), params(26)]) {
      const { steps } = planSchedule(p).schedule;
      expect(steps[0].time.getTime()).toBe(p.startTime.getTime());
      expect(steps[steps.length - 1].time.getTime()).toBe(p.cookTime.getTime());
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].time.getTime()).toBeGreaterThanOrEqual(
          steps[i - 1].time.getTime()
        );
      }
    }
  });

  it("cold proof includes fridge in/out steps", () => {
    const { steps } = planSchedule(params(26)).schedule;
    const labels = steps.map((s) => s.label);
    expect(labels).toContain("Ball & into the fridge");
    expect(labels).toContain("Out of the fridge");
  });

  it("bulk proof starts 15 minutes after mixing", () => {
    const p = params(8);
    const { steps } = planSchedule(p).schedule;
    const bulk = steps.find((s) => s.label === "Bulk proof")!;
    expect(bulk.time.getTime()).toBe(p.startTime.getTime() + 15 * 60_000);
  });

  it("room-only balls the dough 2h before cooking", () => {
    const p = params(8);
    const { steps } = planSchedule(p).schedule;
    const ball = steps.find((s) => s.label === "Ball the dough")!;
    expect(ball.time.getTime()).toBe(p.cookTime.getTime() - 2 * MS_PER_HOUR);
  });

  it("very short room-only balls at the midpoint of the fermentation window", () => {
    const p = params(2);
    const { steps } = planSchedule(p).schedule;
    const ball = steps.find((s) => s.label === "Ball the dough")!;
    // 15 min mixing, then halfway through the remaining 1.75h
    const fermentStart = p.startTime.getTime() + 15 * 60_000;
    expect(ball.time.getTime()).toBe(fermentStart + 0.875 * MS_PER_HOUR);
  });
});
