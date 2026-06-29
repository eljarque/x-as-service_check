import type {
  Assessment,
  AnswerValue,
  DimensionId,
  DimensionStatusValue,
  Divergence,
  Question,
  VerdictResult,
} from '../types';
import { QUESTIONNAIRE, DIMENSION_BY_ID, keyQuestion, questionById } from '../data/questionnaire';

function providerValue(a: Assessment, questionId: string): AnswerValue | undefined {
  return a.answers[questionId]?.provider?.value;
}

function consumerValue(a: Assessment, questionId: string, teamId: string): AnswerValue | undefined {
  return a.answers[questionId]?.consumers?.[teamId]?.value;
}

/** Respuesta "buena" de una pregunta según su polaridad. */
export function goodAnswer(q: Question): AnswerValue {
  return q.invert ? 'no' : 'si';
}

/** Respuesta "mala" de una pregunta según su polaridad. */
export function badAnswer(q: Question): AnswerValue {
  return q.invert ? 'si' : 'no';
}

/** Clasifica una respuesta en good/bad/partial/na teniendo en cuenta la polaridad. */
export function classifyAnswer(q: Question, v: AnswerValue): 'good' | 'bad' | 'partial' | 'na' {
  if (v === 'na') return 'na';
  if (v === 'parcial') return 'partial';
  return v === goodAnswer(q) ? 'good' : 'bad';
}

function isGood(a: Assessment, questionId: string): boolean {
  const q = questionById(questionId);
  const v = providerValue(a, questionId);
  return !!q && v !== undefined && classifyAnswer(q, v) === 'good';
}

function isBad(a: Assessment, questionId: string): boolean {
  const q = questionById(questionId);
  const v = providerValue(a, questionId);
  return !!q && v !== undefined && classifyAnswer(q, v) === 'bad';
}

/** ¿La pregunta tiene una respuesta real? ("parcial" cuenta; vacío o "na" no). */
function isAnswered(a: Assessment, questionId: string): boolean {
  const v = providerValue(a, questionId);
  return v !== undefined && v !== 'na';
}

/** ¿Está bloqueada la dimensión por la regla de puerta? (llave en respuesta "mala"). */
export function gateBlocked(a: Assessment, dimensionId: string): boolean {
  const key = keyQuestion(dimensionId);
  return !!key && isBad(a, key.id);
}

/**
 * Estado de una dimensión:
 *  - rojo: la llave da su respuesta "mala".
 *  - verde: la llave es "buena" y las de profundización son mayoritariamente "buenas".
 *  - ámbar: el resto (incluye llave sin responder o profundización floja).
 */
export function dimensionStatus(a: Assessment, dimensionId: DimensionId): DimensionStatusValue {
  const dim = DIMENSION_BY_ID[dimensionId];
  const key = dim.questions.find((q) => q.isKey);

  if (key && isBad(a, key.id)) return 'rojo';
  if (!key || !isGood(a, key.id)) return 'ambar';

  const followUps = dim.questions.filter((q) => !q.isKey);
  if (followUps.length === 0) return 'verde';

  const scored = followUps
    .map((q) => ({ q, v: providerValue(a, q.id) }))
    .filter((x): x is { q: Question; v: AnswerValue } => x.v !== undefined && x.v !== 'na');

  if (scored.length === 0) return 'ambar';

  const positives = scored.filter((x) => classifyAnswer(x.q, x.v) === 'good').length;
  return positives / scored.length >= 0.5 ? 'verde' : 'ambar';
}

/** Una dimensión es mayoritariamente "buena" (verde). */
function mostlyGood(a: Assessment, dimensionId: DimensionId): boolean {
  return dimensionStatus(a, dimensionId) === 'verde';
}

const KEY_IDS: Record<DimensionId, string> = Object.fromEntries(
  QUESTIONNAIRE.map((d) => [d.id, d.questions.find((q) => q.isKey)!.id]),
) as Record<DimensionId, string>;

/** Calcula el veredicto global según el algoritmo del cuestionario. */
export function computeVerdict(a: Assessment): VerdictResult {
  // No es XaaS: A1 o B1 fallan.
  if (isBad(a, 'A1') || isBad(a, 'B1')) {
    return {
      id: 'no_xaas',
      label: 'No es XaaS',
      rationale:
        'A1 o B1 fallan. La interacción real es colaboración encubierta o dependencia gobernada por coordinación manual.',
    };
  }

  // Si las llaves base aún no se han respondido, no concluimos. "Parcial" sí
  // cuenta como respuesta; solo bloquea estar sin contestar (vacío o N/A).
  const baseKeys = [
    { id: 'A1', label: 'Contrato (A1)' },
    { id: 'B1', label: 'Versionado (B1)' },
  ];
  const blocking = baseKeys.filter((k) => !isAnswered(a, k.id));
  if (blocking.length > 0) {
    const naList = blocking.filter((k) => providerValue(a, k.id) === 'na').map((k) => k.label);
    const emptyList = blocking.filter((k) => providerValue(a, k.id) === undefined).map((k) => k.label);
    const parts: string[] = [];
    if (naList.length) parts.push(`${naList.join(' y ')} en N/A`);
    if (emptyList.length) parts.push(`${emptyList.join(' y ')} sin responder`);
    return {
      id: 'incompleto',
      label: 'Evaluación incompleta',
      rationale: `Las llaves fundamentales deben responderse Sí o No (N/A no permite concluir). Pendiente: ${parts.join('; ')}.`,
    };
  }

  // XaaS nominal: A sí, pero C1 o D1 fallan. La etiqueta existe; la protección, no.
  if (isBad(a, 'C1') || isBad(a, 'D1')) {
    return {
      id: 'nominal',
      label: 'XaaS nominal',
      rationale: 'A está bien, pero C1 o D1 fallan: la etiqueta de "servicio" existe, pero la protección no.',
    };
  }

  // XaaS sólido: las 6 llaves correctas y C y D mayoritariamente "buenas".
  const allKeysAnswered = (Object.values(KEY_IDS) as string[]).every(
    (id) => providerValue(a, id) !== undefined,
  );
  const allKeysGood = (Object.values(KEY_IDS) as string[]).every((id) => isGood(a, id));
  if (allKeysAnswered && allKeysGood && mostlyGood(a, 'C') && mostlyGood(a, 'D')) {
    return {
      id: 'solido',
      label: 'XaaS sólido',
      rationale: 'Las 6 llaves correctas y las dimensiones C y D mayoritariamente bien.',
    };
  }

  // Caso intermedio entre nominal y sólido.
  return {
    id: 'parcial',
    label: 'XaaS parcial / en progreso',
    rationale:
      'Las llaves básicas se cumplen y no hay fallos críticos, pero todavía no se alcanza el nivel sólido (faltan llaves por responder o C/D no son mayoritariamente correctas).',
  };
}

/** Divergencias proveedor↔consumidor en las preguntas de contraste, por equipo. */
export function divergences(a: Assessment): Divergence[] {
  if (!a.consumerContrast) return [];
  const out: Divergence[] = [];
  for (const dim of QUESTIONNAIRE) {
    for (const q of dim.questions) {
      if (!q.isContrast) continue;
      const p = providerValue(a, q.id);
      if (p === undefined) continue;
      for (const team of a.consumerTeams) {
        const c = consumerValue(a, q.id, team.id);
        if (c !== undefined && c !== p) {
          out.push({
            questionId: q.id,
            text: q.text,
            provider: p,
            consumerTeamId: team.id,
            consumerName: team.name,
            consumer: c,
          });
        }
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
