import { CheckCircle2, AlertTriangle, XCircle, CircleDashed, Hourglass } from 'lucide-react';
import type { VerdictId, VerdictResult } from '../types';

const STYLE: Record<VerdictId, { box: string; icon: typeof CheckCircle2 }> = {
  solido: { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: CheckCircle2 },
  parcial: { box: 'bg-sky-50 border-sky-200 text-sky-900', icon: CircleDashed },
  nominal: { box: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle },
  no_xaas: { box: 'bg-red-50 border-red-200 text-red-900', icon: XCircle },
  incompleto: { box: 'bg-slate-50 border-slate-200 text-slate-700', icon: Hourglass },
};

export function VerdictBanner({ verdict }: { verdict: VerdictResult }) {
  const s = STYLE[verdict.id];
  const Icon = s.icon;
  return (
    <div className={`rounded-xl border p-5 flex gap-4 print-break ${s.box}`}>
      <Icon className="w-8 h-8 flex-none" />
      <div>
        <div className="text-xs uppercase tracking-wide opacity-70">Veredicto</div>
        <h2 className="text-2xl font-bold">{verdict.label}</h2>
        <p className="mt-1 text-sm opacity-90">{verdict.rationale}</p>
      </div>
    </div>
  );
}
