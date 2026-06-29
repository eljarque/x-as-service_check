import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Home as HomeIcon, Flag, ListTodo, KeyRound, X } from 'lucide-react';
import type { Answer, AnswerTarget, Assessment, DimensionId, DimensionStatusValue } from '../types';
import { QUESTIONNAIRE } from '../data/questionnaire';
import { dimensionStatus, pendingQuestions } from '../lib/verdict';
import { DimensionStep } from './DimensionStep';

interface Props {
  assessment: Assessment;
  setAnswer: (questionId: string, target: AnswerTarget, patch: Partial<Answer>) => void;
  focusQuestionId?: string;
  onFocusConsumed?: () => void;
  onBack: () => void;
  onFinish: () => void;
}

const STATUS_DOT: Record<DimensionStatusValue, string> = {
  verde: 'bg-emerald-500',
  ambar: 'bg-amber-400',
  rojo: 'bg-red-500',
};

export function Wizard({ assessment, setAnswer, focusQuestionId, onFocusConsumed, onBack, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState<string | undefined>();
  const [showPending, setShowPending] = useState(false);
  const dimension = QUESTIONNAIRE[step];
  const isFirst = step === 0;
  const isLast = step === QUESTIONNAIRE.length - 1;
  const pending = pendingQuestions(assessment);

  // Salta a una pregunta concreta: cambia de dimensión, la resalta y hace scroll.
  function jumpTo(dimensionIndex: number, questionId: string) {
    setStep(dimensionIndex);
    setHighlight(questionId);
    setShowPending(false);
    requestAnimationFrame(() =>
      document.getElementById(`q-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }

  // Deep-link desde Resultados: enfocar una pregunta al entrar.
  useEffect(() => {
    if (!focusQuestionId) return;
    const idx = QUESTIONNAIRE.findIndex((d) => d.questions.some((q) => q.id === focusQuestionId));
    if (idx >= 0) jumpTo(idx, focusQuestionId);
    onFocusConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusQuestionId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Indicador de dimensiones + pendientes */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {QUESTIONNAIRE.map((d, i) => {
          const status = dimensionStatus(assessment, d.id as DimensionId);
          const active = i === step;
          return (
            <button
              key={d.id}
              onClick={() => setStep(i)}
              title={d.title}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium border transition ${
                active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
              {d.id}
            </button>
          );
        })}
        <button
          onClick={() => setShowPending((v) => !v)}
          disabled={pending.length === 0}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium border transition ${
            pending.length === 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
              : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          {pending.length === 0 ? 'Sin pendientes' : `Pendientes (${pending.length})`}
        </button>
      </div>

      {/* Panel de pendientes: salto directo */}
      {showPending && pending.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-900">
              Preguntas sin responder ({pending.length})
            </span>
            <button onClick={() => setShowPending(false)} className="text-amber-700 hover:text-amber-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {pending.map((p) => (
              <li key={p.questionId}>
                <button
                  onClick={() => jumpTo(p.dimensionIndex, p.questionId)}
                  className="w-full text-left flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-amber-100/70"
                >
                  <span className="font-bold text-slate-400 flex-none w-7">{p.questionId}</span>
                  {p.isKey && <KeyRound className="w-3.5 h-3.5 flex-none mt-0.5 text-brand-600" />}
                  <span className="flex-1">{p.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DimensionStep
        dimension={dimension}
        assessment={assessment}
        highlightQuestionId={highlight}
        setAnswer={setAnswer}
      />

      {/* Navegación */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={isFirst ? onBack : () => setStep((s) => s - 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
        >
          {isFirst ? <HomeIcon className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isFirst ? 'Inicio' : 'Anterior'}
        </button>

        <span className="text-xs text-slate-400">
          Dimensión {step + 1} de {QUESTIONNAIRE.length}
        </span>

        {isLast ? (
          <button
            onClick={onFinish}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium"
          >
            <Flag className="w-4 h-4" />
            Ver veredicto
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
