import { describe, it, expect } from "vitest";
import { RASHIS, calculateGunMilan } from "./rashiData";

const byName = (n: string) => RASHIS.find((r) => r.englishName === n)!;

describe("Ashta Koot Gun Milan", () => {
  it("never exceeds 36 points and stays whole-numbered for every sign pair", () => {
    for (const a of RASHIS) for (const b of RASHIS) {
      const r = calculateGunMilan(a, b);
      expect(r.total).toBeGreaterThanOrEqual(0);
      expect(r.total).toBeLessThanOrEqual(36);
      expect(Number.isInteger(r.total)).toBe(true);
    }
  });

  it("Tara gives 1 point for Aries→Taurus, matching the server table", () => {
    const r = calculateGunMilan(byName("Aries"), byName("Taurus"));
    expect(r.tara.points).toBe(1);
  });

  it("Tara gives 0 points at distance 4 (Aries→Leo)", () => {
    expect(calculateGunMilan(byName("Aries"), byName("Leo")).tara.points).toBe(0);
  });
});
