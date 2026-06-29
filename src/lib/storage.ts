import type { Answer, Assessment, ConsumerTeam, QAnswer } from '../types';
import { SCHEMA_VERSION } from '../types';
import { QUESTIONNAIRE } from '../data/questionnaire';

const STORAGE_KEY = 'verificador-xaas:current';

/** IDs de pregunta vigentes en el cuestionario actual. */
const KNOWN_QUESTION_IDS = new Set(QUESTIONNAIRE.flatMap((d) => d.questions.map((q) => q.id)));

/**
 * Descarta respuestas a preguntas que ya no existen (p.ej. la antigua D2) y
 * respuestas de consumidores que ya no están en la lista, para que los
 * re-exports queden limpios y alineados con el estado vigente. Los IDs nuevos
 * (A4, E5) simplemente quedan vacíos.
 */
function sanitizeAnswers(
  answers: Record<string, QAnswer>,
  consumerIds: Set<string>,
): Record<string, QAnswer> {
  const out: Record<string, QAnswer> = {};
  for (const [id, value] of Object.entries(answers)) {
    if (!KNOWN_QUESTION_IDS.has(id) || !value || typeof value !== 'object') continue;
    const clean: QAnswer = { provider: value.provider ?? { value: 'na', notes: '' } };
    if (value.consumers && typeof value.consumers === 'object') {
      const consumers: Record<string, Answer> = {};
      for (const [cid, ans] of Object.entries(value.consumers)) {
        if (consumerIds.has(cid) && ans && typeof ans === 'object') consumers[cid] = ans;
      }
      if (Object.keys(consumers).length > 0) clean.consumers = consumers;
    }
    out[id] = clean;
  }
  return out;
}

export function createEmptyAssessment(): Assessment {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    serviceName: '',
    providerTeam: '',
    consumerTeams: [],
    date: now.slice(0, 10),
    consumerContrast: false,
    answers: {},
    updatedAt: now,
    version: SCHEMA_VERSION,
  };
}

export function saveLocal(a: Assessment): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    /* almacenamiento no disponible: ignorar */
  }
}

export function loadLocal(): Assessment | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorar */
  }
}

/** Forma laxa de un objeto importado (puede venir de un esquema antiguo). */
interface RawAssessment {
  id?: string;
  serviceName?: string;
  providerTeam?: string;
  consumerTeam?: string; // legacy v1: un único consumidor
  consumerTeams?: ConsumerTeam[]; // v2
  date?: string;
  consumerContrast?: boolean;
  answers?: Record<string, { provider?: Answer; consumer?: Answer; consumers?: Record<string, Answer> }>;
  updatedAt?: string;
  version?: number;
}

/** Valida/normaliza un objeto cargado desde JSON, migrando esquemas antiguos. Lanza si no es válido. */
export function normalize(raw: unknown): Assessment {
  if (!raw || typeof raw !== 'object') throw new Error('Archivo no válido.');
  const o = raw as RawAssessment;
  if (o.version !== 1 && o.version !== 2) throw new Error('Versión de archivo no compatible.');
  if (typeof o.answers !== 'object' || o.answers === null) throw new Error('Faltan respuestas.');
  const now = new Date().toISOString();

  // Lista de equipos consumidores (migra el consumidor único de v1 si hace falta).
  let consumerTeams: ConsumerTeam[] = Array.isArray(o.consumerTeams) ? o.consumerTeams : [];
  let legacyTeamId: string | null = null;
  if (consumerTeams.length === 0 && o.consumerTeam && o.consumerTeam.trim()) {
    legacyTeamId = crypto.randomUUID();
    consumerTeams = [{ id: legacyTeamId, name: o.consumerTeam.trim() }];
  }

  // Migra answers v1 (consumer único) → v2 (consumers indexado por equipo).
  const migrated: Record<string, QAnswer> = {};
  for (const [qid, value] of Object.entries(o.answers)) {
    if (!value || typeof value !== 'object') continue;
    const qa: QAnswer = { provider: value.provider ?? { value: 'na', notes: '' } };
    if (value.consumers && typeof value.consumers === 'object') {
      qa.consumers = value.consumers;
    } else if (value.consumer && legacyTeamId) {
      qa.consumers = { [legacyTeamId]: value.consumer };
    }
    migrated[qid] = qa;
  }

  const consumerIds = new Set(consumerTeams.map((t) => t.id));
  return {
    id: o.id ?? crypto.randomUUID(),
    serviceName: o.serviceName ?? '',
    providerTeam: o.providerTeam ?? '',
    consumerTeams,
    date: o.date ?? now.slice(0, 10),
    consumerContrast: !!o.consumerContrast,
    answers: sanitizeAnswers(migrated, consumerIds),
    updatedAt: o.updatedAt ?? now,
    version: SCHEMA_VERSION,
  };
}

function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sin-nombre'
  );
}

export function exportJson(a: Assessment): void {
  const filename = `verificador-xaas-${slugify(a.serviceName)}-${a.date}.json`;
  const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importJson(file: File): Promise<Assessment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(normalize(JSON.parse(String(reader.result))));
      } catch (e) {
        reject(e instanceof Error ? e : new Error('No se pudo leer el archivo.'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file);
  });
}
