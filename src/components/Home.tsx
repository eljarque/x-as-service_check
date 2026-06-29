import { useRef, useState } from 'react';
import { FileUp, Play, RotateCcw, ListChecks, AlertCircle } from 'lucide-react';
import type { Assessment } from '../types';
import { importJson } from '../lib/storage';

interface Props {
  assessment: Assessment;
  setMeta: (patch: Partial<Assessment>) => void;
  replace: (a: Assessment) => void;
  reset: () => void;
  onStart: () => void;
  onViewResults: () => void;
}

const DIMENSIONS = [
  ['A', 'Contrato', '¿Existe la interfaz como artefacto?'],
  ['B', 'Versionado y evolución', '¿Cómo se entera un consumidor de cambios que rompen?'],
  ['C', 'Verificación automática', '¿Se detecta una rotura antes de producción?'],
  ['D', 'Autoservicio', '¿Puede consumirse solo con la documentación?'],
  ['E', 'Operación y fiabilidad', '¿Hay SLO y visibilidad del estado?'],
  ['F', 'Gestión como producto', '¿Se conoce y mide a los consumidores?'],
];

export function Home({ assessment, setMeta, replace, reset, onStart, onViewResults }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const hasProgress = Object.keys(assessment.answers).length > 0;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const loaded = await importJson(file);
      replace(loaded);
      onStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el archivo.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">¿Tu servicio es realmente As-a-Service?</h1>
        <p className="mt-2 text-slate-600">
          Un cuestionario guiado de 6 dimensiones para distinguir un XaaS de verdad de una
          “colaboración encubierta”. El orden importa: cada dimensión presupone la anterior. Si la
          pregunta <strong>llave</strong> de una dimensión es “no”, esa dimensión se marca en rojo y
          se salta a la siguiente.
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {DIMENSIONS.map(([id, title, sub]) => (
            <div key={id} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="flex-none w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-bold">
                {id}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{title}</div>
                <div className="text-xs text-slate-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Datos de la sesión</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Servicio evaluado</span>
            <input
              value={assessment.serviceName}
              onChange={(e) => setMeta({ serviceName: e.target.value })}
              placeholder="p.ej. API de Pagos"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Fecha</span>
            <input
              type="date"
              value={assessment.date}
              onChange={(e) => setMeta({ date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Equipo proveedor</span>
            <input
              value={assessment.providerTeam}
              onChange={(e) => setMeta({ providerTeam: e.target.value })}
              placeholder="Equipo dueño del servicio"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Equipo consumidor</span>
            <input
              value={assessment.consumerTeam}
              onChange={(e) => setMeta({ consumerTeam: e.target.value })}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </label>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-lg bg-brand-50 border border-brand-100 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={assessment.consumerContrast}
            onChange={(e) => setMeta({ consumerContrast: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-brand-600"
          />
          <span className="text-sm text-slate-700">
            <strong>Contraste con el consumidor.</strong> Responder también algunas preguntas clave
            (B1, D1, D2, E2) desde la perspectiva del consumidor. La divergencia entre ambas
            versiones es el dato más valioso de la sesión.
          </span>
        </label>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-none" />
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            {hasProgress ? 'Continuar evaluación' : 'Empezar evaluación'}
          </button>
          {hasProgress && (
            <button
              onClick={onViewResults}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
            >
              <ListChecks className="w-4 h-4" />
              Ver resultados
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
          >
            <FileUp className="w-4 h-4" />
            Cargar JSON
          </button>
          {hasProgress && (
            <button
              onClick={() => {
                if (confirm('¿Empezar una evaluación nueva? Se perderán las respuestas actuales.')) reset();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              Nueva
            </button>
          )}
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </div>
      </section>
    </div>
  );
}
