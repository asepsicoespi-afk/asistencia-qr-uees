import {
  PARALELOS,
  FALTA_POINTS,
  ATRASO_POINTS,
  ATRASOS_PER_FALTA,
  type Paralelo,
} from "./constants";

export type Estado =
  | "OK"
  | "EN_RIESGO"
  | "ADVERTENCIA_FORMAL"
  | "PIERDE_CURSO";

export function calculateFaltasEfectivas(
  faltasDirectas: number,
  atrasos: number
): number {
  return faltasDirectas + Math.floor(atrasos / ATRASOS_PER_FALTA);
}

export function calculateDescuento(
  faltasDirectas: number,
  atrasos: number
): number {
  return -(faltasDirectas * FALTA_POINTS + atrasos * ATRASO_POINTS);
}

export function getEstado(
  faltasEfectivas: number,
  paralelo: Paralelo
): Estado {
  const config = PARALELOS[paralelo];
  if (faltasEfectivas >= config.pierdeCurso) return "PIERDE_CURSO";
  if (faltasEfectivas >= config.advertenciaFormal) return "ADVERTENCIA_FORMAL";
  if (faltasEfectivas >= config.advertenciaFormal - 1) return "EN_RIESGO";
  return "OK";
}
