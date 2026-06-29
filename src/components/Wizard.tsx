import { useState } from 'react';
import { ArrowLeft, ArrowRight, Home as HomeIcon, Flag } from 'lucide-react';
import type { Answer, Assessment, DimensionId, DimensionStatusValue } from '../types';
import { QUESTIONNAIRE } from '../data/questionnaire';
import { dimensionStatus } from '../lib/verdict';
import { DimensionStep } from './DimensionStep';

interface Props {
  assessment: Assessment;
  setAnswer: (questionId: string, side: 'provider' | 'consumer', patch: Partial<Answer>) => void;
  onBack: () => void;
  onFinish: () => void;
}

const STATUS_DOT: Record<DimensionStatusValue, string> = {
  verde: 'bg-emerald-500',
  ambar: 'bg-amber-400',
  rojo: 'bg-red-500',
};

export function Wizard({ assessment, setAnswer, onBack, onFinish }: Props) {
  const [step, setStep] = useState(0);
  const dimension = QUESTIONNAIRE[step];
  const isFirst = step === 0;
  const isLast = step === QUESTIONNAIRE.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Indicador de dimensiones */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
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
      </div>

      <DimensionStep dimension={dimension} assessment={assessment} setAnswer={setAnswer} />

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
