import type {
  Assessment,
  AnswerValue,
  DimensionId,
  DimensionStatusValue,
  Divergence,
  VerdictResult,
} from '../types';
import { QUESTIONNAIRE, DIMENSION_BY_ID, keyQuestion, questionById } from '../data/questionnaire';

function providerValue(a: Assessment, questionId: string): AnswerValue | undefined {
  return a.answers[questionId]?.provider?.value;
}

function consumerValue(a: Assessment, questionId: string): AnswerValue | undefined {
  return a.answers[questionId]?.consumer?.value;
}

/** ¿Está bloqueada la dimensión por la regla de puerta? (llave en "no"). */
export function gateBlocked(a: Assessment, dimensionId: string): boolean {
  const key = keyQuestion(dimensionId);
  return !!key && providerValue(a, key.id) === 'no';
}

/**
 * Estado de una dimensión:
 *  - rojo: la llave es "no".
 *  - verde: la llave es "sí" y las de profundización son mayoritariamente "sí".
 *  - ámbar: el resto (incluye llave sin responder o profundización floja).
 */
export function dimensionStatus(a: Assessment, dimensionId: DimensionId): DimensionStatusValue {
  const dim = DIMENSION_BY_ID[dimensionId];
  const key = dim.questions.find((q) => q.isKey);
  const keyVal = key ? providerValue(a, key.id) : undefined;

  if (keyVal === 'no') return 'rojo';
  if (keyVal !== 'si') return 'ambar';

  const followUps = dim.questions.filter((q) => !q.isKey);
  if (followUps.length === 0) return 'verde';

  const scored = followUps
    .map((q) => providerValue(a, q.id))
    .filter((v): v is AnswerValue => v !== undefined && v !== 'na');

  if (scored.length === 0) return 'ambar';

  const positives = scored.filter((v) => v === 'si').length;
  return positives / scored.length >= 0.5 ? 'verde' : 'ambar';
}

/** Las dimensiones de C y D son mayoritariamente "sí" (incluyendo su llave). */
function mostlyYes(a: Assessment, dimensionId: DimensionId): boolean {
  const status = dimensionStatus(a, dimensionId);
  return status === 'verde';
}

const KEY_IDS: Record<DimensionId, string> = Object.fromEntries(
  QUESTIONNAIRE.map((d) => [d.id, d.questions.find((q) => q.isKey)!.id]),
) as Record<DimensionId, string>;

/** Calcula el veredicto global según el algoritmo del cuestionario. */
export function computeVerdict(a: Assessment): VerdictResult {
  const a1 = providerValue(a, 'A1');
  const b1 = providerValue(a, 'B1');
  const c1 = providerValue(a, 'C1');
  const d1 = providerValue(a, 'D1');

  // No es XaaS: A1 o B1 fallan.
  if (a1 === 'no' || b1 === 'no') {
    return {
      id: 'no_xaas',
      label: 'No es XaaS',
      rationale:
        'A1 o B1 fallan. La interacción real es colaboración encubierta o dependencia gobernada por coordinación manual.',
    };
  }

  // Si las llaves base aún no están respondidas, no concluimos.
  const allKeysAnswered = (Object.values(KEY_IDS) as string[]).every(
    (id) => providerValue(a, id) !== undefined,
  );
  if (a1 !== 'si' || b1 !== 'si') {
    return {
      id: 'incompleto',
      label: 'Evaluación incompleta',
      rationale: 'Responde al menos las llaves de Contrato (A1) y Versionado (B1) para obtener un veredicto.',
    };
  }

  // XaaS nominal: A sí, pero C1 o D1 fallan. La etiqueta existe; la protección, no.
  if (c1 === 'no' || d1 === 'no') {
    return {
      id: 'nominal',
      label: 'XaaS nominal',
      rationale: 'A está bien, pero C1 o D1 fallan: la etiqueta de "servicio" existe, pero la protección no.',
    };
  }

  // XaaS sólido: las 6 llaves en "sí" y C y D mayoritariamente en "sí".
  const allKeysYes = (Object.values(KEY_IDS) as string[]).every((id) => providerValue(a, id) === 'si');
  if (allKeysAnswered && allKeysYes && mostlyYes(a, 'C') && mostlyYes(a, 'D')) {
    return {
      id: 'solido',
      label: 'XaaS sólido',
      rationale: 'Las 6 llaves en "sí" y las dimensiones C y D mayoritariamente en "sí".',
    };
  }

  // Caso intermedio entre nominal y sólido.
  return {
    id: 'parcial',
    label: 'XaaS parcial / en progreso',
    rationale:
      'Las llaves básicas se cumplen y no hay fallos críticos, pero todavía no se alcanza el nivel sólido (faltan llaves por responder o C/D no son mayoritariamente "sí").',
  };
}

/** Divergencias proveedor↔consumidor en las preguntas de contraste. */
export function divergences(a: Assessment): Divergence[] {
  if (!a.consumerContrast) return [];
  const out: Divergence[] = [];
  for (const dim of QUESTIONNAIRE) {
    for (const q of dim.questions) {
      if (!q.isContrast) continue;
      const p = providerValue(a, q.id);
      const c = consumerValue(a, q.id);
      if (p !== undefined && c !== undefined && p !== c) {
        out.push({ questionId: q.id, text: q.text, provider: p, consumer: c });
      }
    }
  }
  return out;
}

/** Dimensiones que necesitan remediación (rojas o ámbar), en orden A → F. */
export function failingDimensions(a: Assessment): DimensionId[] {
  return QUESTIONNAIRE.map((d) => d.id).filter((id) => dimensionStatus(a, id) !== 'verde');
}

export { questionById };
