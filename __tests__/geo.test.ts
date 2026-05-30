import { describe, it, expect } from "vitest";
import { haversineDistance, isWithinRadius } from "@/lib/geo";

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(-2.1469, -79.9665, -2.1469, -79.9665)).toBe(0);
  });
  it("calculates known distance (~111km for 1 degree lat)", () => {
    const dist = haversineDistance(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(110000);
    expect(dist).toBeLessThan(112000);
  });
  it("calculates short distance correctly", () => {
    const dist = haversineDistance(-2.1469, -79.9665, -2.14717, -79.9665);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(40);
  });
});

describe("isWithinRadius", () => {
  it("returns true for same point", () => {
    expect(isWithinRadius(-2.1469, -79.9665, -2.1469, -79.9665, 50)).toBe(true);
  });
  it("returns true for point within radius", () => {
    expect(isWithinRadius(-2.1469, -79.9665, -2.14717, -79.9665, 50)).toBe(true);
  });
  it("returns false for point outside radius", () => {
    expect(isWithinRadius(-2.1469, -79.9665, -2.156, -79.9665, 50)).toBe(false);
  });
});
