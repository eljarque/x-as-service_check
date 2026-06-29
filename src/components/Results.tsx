import { Download, Printer, Pencil, Home as HomeIcon } from 'lucide-react';
import type { Assessment, AnswerValue, DimensionId, DimensionStatusValue } from '../types';
import { QUESTIONNAIRE } from '../data/questionnaire';
import { computeVerdict, dimensionStatus } from '../lib/verdict';
import { exportJson } from '../lib/storage';
import { VerdictBanner } from './VerdictBanner';
import { RemediationMap } from './RemediationMap';
import { DivergencePanel } from './DivergencePanel';

interface Props {
  assessment: Assessment;
  onEdit: () => void;
  onHome: () => void;
}

const STATUS_RING: Record<DimensionStatusValue, string> = {
  verde: 'border-emerald-300 bg-emerald-50',
  ambar: 'border-amber-300 bg-amber-50',
  rojo: 'border-red-300 bg-red-50',
};
const STATUS_DOT: Record<DimensionStatusValue, string> = {
  verde: 'bg-emerald-500',
  ambar: 'bg-amber-400',
  rojo: 'bg-red-500',
};
const VAL_LABEL: Record<AnswerValue, string> = { si: 'Sí', parcial: 'Parcial', no: 'No', na: 'N/A' };

export function Results({ assessment, onEdit, onHome }: Props) {
  const verdict = computeVerdict(assessment);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 print-page">
      {/* Acciones */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <HomeIcon className="w-4 h-4" /> Inicio
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <Pencil className="w-4 h-4" /> Editar respuestas
        </button>
        <div className="ml-auto flex gap-3">
          <button
            onClick={() => exportJson(assessment)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <Download className="w-4 h-4" /> Exportar JSON
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-sm font-medium"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Cabecera del informe */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Informe XaaS — {assessment.serviceName || 'Servicio sin nombre'}
        </h1>
        <p className="text-sm text-slate-500">
          {[assessment.providerTeam && `Proveedor: ${assessment.providerTeam}`,
            assessment.consumerTeam && `Consumidor: ${assessment.consumerTeam}`,
            assessment.date]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <VerdictBanner verdict={verdict} />

      {/* Estado por dimensión */}
      <div className="mt-5 grid sm:grid-cols-2 gap-3 print-break">
        {QUESTIONNAIRE.map((d) => {
          const status = dimensionStatus(assessment, d.id as DimensionId);
          return (
            <div key={d.id} className={`rounded-xl border p-3 flex items-center gap-3 ${STATUS_RING[status]}`}>
              <span className="flex-none w-8 h-8 rounded-md bg-white/70 grid place-items-center text-sm font-bold text-slate-700">
                {d.id}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{d.title}</div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 capitalize">
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
                {status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-5">
        <DivergencePanel assessment={assessment} />
        <RemediationMap assessment={assessment} />
      </div>

      {/* Apéndice de respuestas (para el PDF) */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 print-break">
        <h3 className="text-lg font-semibold text-slate-900">Detalle de respuestas</h3>
        <div className="mt-3 space-y-4">
          {QUESTIONNAIRE.map((d) => (
            <div key={d.id}>
              <div className="text-sm font-bold text-slate-700">
                {d.id}. {d.title}
              </div>
              <ul className="mt-1 space-y-1">
                {d.questions.map((q) => {
                  const ans = assessment.answers[q.id];
                  const p = ans?.provider?.value;
                  const c = ans?.consumer?.value;
                  return (
                    <li key={q.id} className="text-sm text-slate-600 flex flex-wrap gap-x-2 border-b border-slate-50 py-1">
                      <span className="font-semibold text-slate-400">{q.id}</span>
                      <span className="flex-1 min-w-[12rem]">{q.text}</span>
                      <span className="font-medium text-slate-700">{p ? VAL_LABEL[p] : '—'}</span>
                      {assessment.consumerContrast && q.isContrast && (
                        <span className="text-violet-600">/ cons.: {c ? VAL_LABEL[c] : '—'}</span>
                      )}
                      {ans?.provider?.notes && (
                        <span className="w-full text-xs text-slate-400 italic">↳ {ans.provider.notes}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
