import type { Assessment } from '../types';

const STORAGE_KEY = 'verificador-xaas:current';

export function createEmptyAssessment(): Assessment {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    serviceName: '',
    providerTeam: '',
    consumerTeam: '',
    date: now.slice(0, 10),
    consumerContrast: false,
    answers: {},
    updatedAt: now,
    version: 1,
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

/** Valida/normaliza un objeto cargado desde JSON. Lanza si no es válido. */
export function normalize(raw: unknown): Assessment {
  if (!raw || typeof raw !== 'object') throw new Error('Archivo no válido.');
  const o = raw as Partial<Assessment>;
  if (o.version !== 1) throw new Error('Versión de archivo no compatible.');
  if (typeof o.answers !== 'object' || o.answers === null) throw new Error('Faltan respuestas.');
  const now = new Date().toISOString();
  return {
    id: o.id ?? crypto.randomUUID(),
    serviceName: o.serviceName ?? '',
    providerTeam: o.providerTeam ?? '',
    consumerTeam: o.consumerTeam ?? '',
    date: o.date ?? now.slice(0, 10),
    consumerContrast: !!o.consumerContrast,
    answers: o.answers as Assessment['answers'],
    updatedAt: o.updatedAt ?? now,
    version: 1,
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
