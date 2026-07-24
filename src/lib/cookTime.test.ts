import { describe, expect, it } from "vitest";
import { defaultCookTime, restoreCookTime } from "./cookTime";

const now = new Date("2026-07-07T10:00:00");

describe("defaultCookTime", () => {
  it("is tomorrow at 18:00", () => {
    expect(defaultCookTime(now)).toEqual(new Date("2026-07-08T18:00:00"));
  });
});

describe("restoreCookTime", () => {
  it("falls back to the default when nothing is stored", () => {
    expect(restoreCookTime(null, now)).toEqual(defaultCookTime(now));
  });

  it("falls back to the default for an invalid value", () => {
    expect(restoreCookTime("garbage", now)).toEqual(defaultCookTime(now));
  });

  it("keeps a stored time that is still in the future", () => {
    const future = new Date("2026-07-12T19:30:00");
    expect(restoreCookTime(future.toISOString(), now)).toEqual(future);
  });

  it("rolls a passed cook time forward to today when the clock time is still ahead", () => {
    const past = new Date("2026-07-05T19:30:00");
    expect(restoreCookTime(past.toISOString(), now)).toEqual(
      new Date("2026-07-07T19:30:00")
    );
  });

  it("rolls a passed cook time forward to tomorrow when the clock time has passed today", () => {
    const past = new Date("2026-07-05T08:00:00");
    expect(restoreCookTime(past.toISOString(), now)).toEqual(
      new Date("2026-07-08T08:00:00")
    );
  });
});
