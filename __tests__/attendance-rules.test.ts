import { describe, it, expect } from "vitest";
import {
  calculateFaltasEfectivas,
  calculateDescuento,
  getEstado,
} from "@/lib/attendance-rules";

describe("calculateFaltasEfectivas", () => {
  it("returns faltas when no atrasos", () => {
    expect(calculateFaltasEfectivas(2, 0)).toBe(2);
  });
  it("converts 3 atrasos to 1 falta", () => {
    expect(calculateFaltasEfectivas(0, 3)).toBe(1);
  });
  it("converts 6 atrasos to 2 faltas", () => {
    expect(calculateFaltasEfectivas(0, 6)).toBe(2);
  });
  it("does not count residual atrasos as falta", () => {
    expect(calculateFaltasEfectivas(1, 2)).toBe(1);
  });
  it("combines faltas and converted atrasos", () => {
    expect(calculateFaltasEfectivas(2, 4)).toBe(3);
  });
});

describe("calculateDescuento", () => {
  it("calculates points for faltas only", () => {
    expect(calculateDescuento(3, 0)).toBeCloseTo(-3.0);
  });
  it("calculates points for atrasos only", () => {
    expect(calculateDescuento(0, 2)).toBeCloseTo(-0.66);
  });
  it("combines falta and atraso points", () => {
    expect(calculateDescuento(2, 1)).toBeCloseTo(-2.33);
  });
});

describe("getEstado", () => {
  it("returns OK for 1 falta in M02", () => {
    expect(getEstado(1, "M02")).toBe("OK");
  });
  it("returns EN_RIESGO for 2 faltas in M02", () => {
    expect(getEstado(2, "M02")).toBe("EN_RIESGO");
  });
  it("returns ADVERTENCIA_FORMAL for 3 faltas in M02", () => {
    expect(getEstado(3, "M02")).toBe("ADVERTENCIA_FORMAL");
  });
  it("returns PIERDE_CURSO for 4 faltas in M02", () => {
    expect(getEstado(4, "M02")).toBe("PIERDE_CURSO");
  });
  it("returns PIERDE_CURSO for 5 faltas in P04", () => {
    expect(getEstado(5, "P04")).toBe("PIERDE_CURSO");
  });
  it("returns OK for 4 faltas in P83", () => {
    expect(getEstado(4, "P83")).toBe("OK");
  });
  it("returns EN_RIESGO for 5 faltas in P83", () => {
    expect(getEstado(5, "P83")).toBe("EN_RIESGO");
  });
  it("returns ADVERTENCIA_FORMAL for 6 faltas in P83", () => {
    expect(getEstado(6, "P83")).toBe("ADVERTENCIA_FORMAL");
  });
  it("returns PIERDE_CURSO for 7 faltas in P83", () => {
    expect(getEstado(7, "P83")).toBe("PIERDE_CURSO");
  });
});
