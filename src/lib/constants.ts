export type Paralelo = "M02" | "P83" | "P04";

export interface ParaleloConfig {
  id: Paralelo;
  label: string;
  advertenciaFormal: number;
  pierdeCurso: number;
}

export const PARALELOS: Record<Paralelo, ParaleloConfig> = {
  M02: {
    id: "M02",
    label: "M02 — Medicina",
    advertenciaFormal: 3,
    pierdeCurso: 4,
  },
  P04: {
    id: "P04",
    label: "P04",
    advertenciaFormal: 3,
    pierdeCurso: 4,
  },
  P83: {
    id: "P83",
    label: "P83",
    advertenciaFormal: 6,
    pierdeCurso: 7,
  },
};

export const FALTA_POINTS = 1.0;
export const ATRASO_POINTS = 0.33;
export const ATRASOS_PER_FALTA = 3;

export const PRESENTE_WINDOW_MS = 3 * 60 * 1000;
export const TOTAL_WINDOW_MS = 5 * 60 * 1000;

export const SHEET_ESTUDIANTES = "Estudiantes";
export const SHEET_SESIONES = "Sesiones";
export const SHEET_REGISTROS = "Registros";
export const SHEET_RESUMEN = "Resumen";
