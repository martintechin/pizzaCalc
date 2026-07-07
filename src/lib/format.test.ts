import { describe, expect, it } from "vitest";
import {
  formatGrams,
  formatHours,
  formatStepTime,
  fromDatetimeLocal,
  toDatetimeLocal,
} from "./format";

describe("formatStepTime", () => {
  const reference = new Date("2026-07-07T10:00:00");

  it("shows only the time for the same day, 24h clock", () => {
    expect(formatStepTime(new Date("2026-07-07T18:30:00"), reference)).toBe("18:30");
  });

  it("adds the weekday within a week", () => {
    const result = formatStepTime(new Date("2026-07-08T18:00:00"), reference);
    expect(result).toMatch(/^ons\.? 18:00$/);
  });

  it("adds the date beyond a week", () => {
    const result = formatStepTime(new Date("2026-07-20T18:00:00"), reference);
    expect(result).toContain("20 juli");
    expect(result).toContain("18:00");
  });
});

describe("formatHours", () => {
  it("rounds to half hours", () => {
    expect(formatHours(26.1)).toBe("26 h");
    expect(formatHours(3.4)).toBe("3,5 h");
  });
});

describe("datetime-local helpers", () => {
  it("round-trips a local date", () => {
    const date = new Date(2026, 6, 8, 18, 0);
    const value = toDatetimeLocal(date);
    expect(value).toBe("2026-07-08T18:00");
    expect(fromDatetimeLocal(value)!.getTime()).toBe(date.getTime());
  });

  it("returns null for empty or invalid values", () => {
    expect(fromDatetimeLocal("")).toBeNull();
    expect(fromDatetimeLocal("garbage")).toBeNull();
  });
});

describe("formatGrams", () => {
  it("adapts precision to magnitude with sv-SE decimals", () => {
    expect(formatGrams(543)).toBe("543 g");
    expect(formatGrams(5.3)).toBe("5,3 g");
    expect(formatGrams(0.42)).toBe("0,42 g");
  });
});
