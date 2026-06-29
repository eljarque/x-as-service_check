import { GitCompareArrows } from 'lucide-react';
import type { Assessment, AnswerValue } from '../types';
import { divergences } from '../lib/verdict';

const LABEL: Record<AnswerValue, string> = { si: 'Sí', parcial: 'Parcial', no: 'No', na: 'N/A' };
const COLOR: Record<AnswerValue, string> = {
  si: 'text-emerald-700 bg-emerald-50',
  parcial: 'text-amber-700 bg-amber-50',
  no: 'text-red-700 bg-red-50',
  na: 'text-slate-500 bg-slate-50',
};

export function DivergencePanel({ assessment }: { assessment: Assessment }) {
  if (!assessment.consumerContrast) return null;
  const divs = divergences(assessment);

  return (
    <div className="rounded-xl border border-violet-200 bg-white p-5 print-break">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <GitCompareArrows className="w-5 h-5 text-violet-600" />
        Divergencia proveedor ↔ consumidor
      </h3>
      {divs.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          No hay divergencias en las preguntas de contraste respondidas. Proveedor y consumidor
          coinciden en su percepción.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-500">
            Donde las dos versiones no coinciden está el dato más valioso de la sesión: la
            interacción real difiere de la percibida.
          </p>
          <ul className="mt-3 space-y-3">
            {divs.map((d) => (
              <li key={d.questionId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-sm text-slate-800">
                  <span className="font-bold text-slate-400 mr-1">{d.questionId}</span>
                  {d.text}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-md px-2 py-1 font-medium ${COLOR[d.provider]}`}>
                    Proveedor: {LABEL[d.provider]}
                  </span>
                  <span className={`rounded-md px-2 py-1 font-medium ${COLOR[d.consumer]}`}>
                    Consumidor: {LABEL[d.consumer]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
