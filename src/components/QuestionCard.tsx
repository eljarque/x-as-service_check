import { KeyRound, Users, RefreshCcw, AlertTriangle } from 'lucide-react';
import type { Answer, AnswerTarget, AnswerValue, ConsumerTeam, QAnswer, Question } from '../types';
import { classifyAnswer } from '../lib/verdict';

interface Props {
  question: Question;
  answer: QAnswer | undefined;
  consumerTeams: ConsumerTeam[];
  highlight?: boolean;
  onChange: (target: AnswerTarget, patch: Partial<Answer>) => void;
}

const OPTIONS: { value: AnswerValue; label: string }[] = [
  { value: 'si', label: 'Sí' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' },
];

// Color según si la opción es buena/mala para esa pregunta (respeta la polaridad).
const TONE: Record<'good' | 'bad' | 'partial' | 'na', { cls: string; active: string }> = {
  good: { cls: 'border-emerald-300 text-emerald-700', active: 'bg-emerald-600 text-white border-emerald-600' },
  bad: { cls: 'border-red-300 text-red-700', active: 'bg-red-600 text-white border-red-600' },
  partial: { cls: 'border-amber-300 text-amber-700', active: 'bg-amber-500 text-white border-amber-500' },
  na: { cls: 'border-slate-300 text-slate-500', active: 'bg-slate-500 text-white border-slate-500' },
};

function Selector({
  question,
  value,
  onPick,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onPick: (v: AnswerValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        const tone = TONE[classifyAnswer(question, o.value)];
        return (
          <button
            key={o.value}
            onClick={() => onPick(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              active ? tone.active : `bg-white hover:bg-slate-50 ${tone.cls}`
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionCard({ question, answer, consumerTeams, highlight, onChange }: Props) {
  const showConsumer = question.isContrast && consumerTeams.length > 0;

  return (
    <div
      id={`q-${question.id}`}
      className={`rounded-xl border bg-white p-4 print-break scroll-mt-24 transition ${
        highlight ? 'border-brand-500 ring-2 ring-brand-300' : 'border-slate-200'
      }`}
    >
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
            {question.invert && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-0.5">
                <RefreshCcw className="w-3 h-3" /> "No" es lo bueno
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
              question={question}
              value={answer?.provider?.value}
              onPick={(v) => onChange('provider', { value: v })}
            />
            {question.isKey && answer?.provider?.value === 'na' && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 flex-none text-amber-600" />
                Una llave en N/A no permite concluir: respóndela Sí o No para obtener veredicto.
              </div>
            )}
            <textarea
              value={answer?.provider?.notes ?? ''}
              onChange={(e) => onChange('provider', { notes: e.target.value })}
              placeholder="Notas / evidencia…"
              rows={2}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          {showConsumer &&
            consumerTeams.map((team) => {
              const ans = answer?.consumers?.[team.id];
              return (
                <div key={team.id} className="mt-3 rounded-lg bg-violet-50/60 border border-violet-100 p-3">
                  <div className="text-xs font-semibold text-violet-700 mb-1">
                    Consumidor: {team.name || 'Equipo sin nombre'}
                  </div>
                  <Selector
                    question={question}
                    value={ans?.value}
                    onPick={(v) => onChange({ consumerTeamId: team.id }, { value: v })}
                  />
                  <textarea
                    value={ans?.notes ?? ''}
                    onChange={(e) => onChange({ consumerTeamId: team.id }, { notes: e.target.value })}
                    placeholder="Notas del consumidor…"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-white"
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
