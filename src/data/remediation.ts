import type { DimensionId } from '../types';

/** Mapa de remediación: primera acción a tomar si falla cada dimensión. */
export const REMEDIATION: Record<DimensionId, string> = {
  A: 'Escribir la especificación OpenAPI/AsyncAPI del estado actual (as-is), antes de tocar nada más.',
  B: 'Adoptar version identifier + semantic versioning; pactar política Two in Production para breaking changes.',
  C: 'Introducir diff de especificaciones en pipeline (openapi-diff); luego contract testing, empezando por producer contracts y evolucionando a CDC si los consumidores son internos.',
  D: 'Documentación de onboarding + stub/sandbox generado del contrato; medir "tickets hasta primera llamada".',
  E: 'Definir SLO publicado y visible para consumidores; canal único de incidencias.',
  F: 'Inventario de consumidores por versión; métricas de uso por endpoint.',
};

/** La secuencia de remediación también es A → F: no inviertas en F si A está roja. */
export const REMEDIATION_NOTE =
  'La secuencia de remediación es A → F: no inviertas en una dimensión posterior si una anterior está en rojo. Cada dimensión presupone la anterior.';
