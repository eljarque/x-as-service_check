export type AnswerValue = 'si' | 'parcial' | 'no' | 'na';

export interface Answer {
  value: AnswerValue;
  notes: string;
}

/** Un equipo consumidor del servicio (pueden ser varios). */
export interface ConsumerTeam {
  id: string;
  name: string;
}

/**
 * Respuesta a una pregunta: el proveedor siempre; los consumidores (uno por
 * equipo consumidor) solo en preguntas de contraste, indexados por su id.
 */
export interface QAnswer {
  provider: Answer;
  consumers?: Record<string, Answer>;
}

/** Objetivo de una respuesta: el proveedor o un equipo consumidor concreto. */
export type AnswerTarget = 'provider' | { consumerTeamId: string };

export type DimensionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Question {
  id: string; // p.ej. "A1"
  text: string;
  isKey?: boolean; // pregunta "llave" (regla de puerta)
  isContrast?: boolean; // se pregunta también al consumidor
  invert?: boolean; // si true, la respuesta "buena" es "no" (p.ej. D1, D3)
  hint?: string; // nota/aclaración del cuestionario
}

export interface Dimension {
  id: DimensionId;
  title: string;
  intro?: string;
  questions: Question[];
}

export type DimensionStatusValue = 'rojo' | 'ambar' | 'verde';

export type VerdictId = 'no_xaas' | 'nominal' | 'parcial' | 'solido' | 'incompleto';

export interface VerdictResult {
  id: VerdictId;
  label: string;
  rationale: string;
}

export interface Divergence {
  questionId: string;
  text: string;
  provider: AnswerValue;
  consumerTeamId: string;
  consumerName: string;
  consumer: AnswerValue;
}

export const SCHEMA_VERSION = 2;

export interface Assessment {
  id: string;
  serviceName: string;
  providerTeam: string;
  consumerTeams: ConsumerTeam[];
  date: string; // ISO (fecha de la sesión)
  consumerContrast: boolean;
  answers: Record<string, QAnswer>;
  updatedAt: string; // ISO
  version: 2;
}
