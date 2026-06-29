import { KeyRound, Users } from 'lucide-react';
import type { Answer, AnswerValue, QAnswer, Question } from '../types';

interface Props {
  question: Question;
  answer: QAnswer | undefined;
  consumerContrast: boolean;
  onChange: (side: 'provider' | 'consumer', patch: Partial<Answer>) => void;
}

const OPTIONS: { value: AnswerValue; label: string; cls: string; active: string }[] = [
  { value: 'si', label: 'Sí', cls: 'border-emerald-300 text-emerald-700', active: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'parcial', label: 'Parcial', cls: 'border-amber-300 text-amber-700', active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'no', label: 'No', cls: 'border-red-300 text-red-700', active: 'bg-red-600 text-white border-red-600' },
  { value: 'na', label: 'N/A', cls: 'border-slate-300 text-slate-500', active: 'bg-slate-500 text-white border-slate-500' },
];

function Selector({
  value,
  onPick,
}: {
  value: AnswerValue | undefined;
  onPick: (v: AnswerValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onPick(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              active ? o.active : `bg-white hover:bg-slate-50 ${o.cls}`
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionCard({ question, answer, consumerContrast, onChange }: Props) {
  const showConsumer = consumerContrast && question.isContrast;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 print-break">
      <div className="flex items-start gap-2">
        <span className="flex-none text-xs font-bold text-slate-400 mt-0.5 w-7">{question.id}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {question.isKey && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold px-2 py-0.5">
                <KeyRound className="w-3 h-3" /> Llave
              </span>
            )}
            {question.isContrast && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold px-2 py-0.5">
                <Users className="w-3 h-3" /> Contraste
              </span>
            )}
          </div>
          <p className="mt-1 text-slate-800">{question.text}</p>
          {question.hint && <p className="mt-1 text-xs text-slate-500 italic">{question.hint}</p>}

          <div className="mt-3">
            {showConsumer && (
              <div className="text-xs font-semibold text-slate-500 mb-1">Proveedor</div>
            )}
            <Selector
              value={answer?.provider?.value}
              onPick={(v) => onChange('provider', { value: v })}
            />
            <textarea
              value={answer?.provider?.notes ?? ''}
              onChange={(e) => onChange('provider', { notes: e.target.value })}
              placeholder="Notas / evidencia…"
              rows={2}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          {showConsumer && (
            <div className="mt-3 rounded-lg bg-violet-50/60 border border-violet-100 p-3">
              <div className="text-xs font-semibold text-violet-700 mb-1">
                Consumidor (perspectiva del equipo que consume)
              </div>
              <Selector
                value={answer?.consumer?.value}
                onPick={(v) => onChange('consumer', { value: v })}
              />
              <textarea
                value={answer?.consumer?.notes ?? ''}
                onChange={(e) => onChange('consumer', { notes: e.target.value })}
                placeholder="Notas del consumidor…"
                rows={2}
                className="mt-2 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
