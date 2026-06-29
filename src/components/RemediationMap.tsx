import { Wrench, Info } from 'lucide-react';
import type { Assessment, DimensionId, DimensionStatusValue } from '../types';
import { DIMENSION_BY_ID } from '../data/questionnaire';
import { REMEDIATION, REMEDIATION_NOTE } from '../data/remediation';
import { dimensionStatus, failingDimensions } from '../lib/verdict';

const STATUS_BADGE: Record<DimensionStatusValue, string> = {
  rojo: 'bg-red-100 text-red-700',
  ambar: 'bg-amber-100 text-amber-700',
  verde: 'bg-emerald-100 text-emerald-700',
};

export function RemediationMap({ assessment }: { assessment: Assessment }) {
  const failing = failingDimensions(assessment);

  if (failing.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 print-break">
        Todas las dimensiones están en verde. No hay acciones de remediación pendientes.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 print-break">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Wrench className="w-5 h-5 text-brand-600" />
        Mapa de remediación
      </h3>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
        <Info className="w-4 h-4 flex-none mt-0.5" />
        {REMEDIATION_NOTE}
      </div>
      <ul className="mt-4 space-y-3">
        {failing.map((id: DimensionId) => {
          const status = dimensionStatus(assessment, id);
          return (
            <li key={id} className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-md bg-brand-600 text-white grid place-items-center text-sm font-bold">
                {id}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{DIMENSION_BY_ID[id].title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
                    {status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{REMEDIATION[id]}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
