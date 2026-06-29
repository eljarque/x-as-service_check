import { ShieldAlert } from 'lucide-react';
import type { Answer, AnswerTarget, Assessment, Dimension } from '../types';
import { QuestionCard } from './QuestionCard';
import { gateBlocked } from '../lib/verdict';

interface Props {
  dimension: Dimension;
  assessment: Assessment;
  highlightQuestionId?: string;
  setAnswer: (questionId: string, target: AnswerTarget, patch: Partial<Answer>) => void;
}

export function DimensionStep({ dimension, assessment, highlightQuestionId, setAnswer }: Props) {
  const blocked = gateBlocked(assessment, dimension.id);
  const keyQ = dimension.questions.find((q) => q.isKey)!;
  const followUps = dimension.questions.filter((q) => !q.isKey);

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex-none w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center text-lg font-bold">
          {dimension.id}
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dimension.title}</h2>
          {dimension.intro && <p className="text-sm text-slate-500">{dimension.intro}</p>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <QuestionCard
          question={keyQ}
          answer={assessment.answers[keyQ.id]}
          consumerTeams={assessment.consumerContrast ? assessment.consumerTeams : []}
          highlight={highlightQuestionId === keyQ.id}
          onChange={(target, patch) => setAnswer(keyQ.id, target, patch)}
        />

        {blocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-none mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Regla de puerta:</strong> la respuesta a la llave es desfavorable, así que esta
              dimensión queda en <strong>rojo</strong>. No hace falta responder el resto; usa las
              notas de la llave para dimensionar el gap y continúa a la siguiente dimensión.
            </div>
          </div>
        ) : (
          followUps.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              answer={assessment.answers[q.id]}
              consumerTeams={assessment.consumerContrast ? assessment.consumerTeams : []}
              highlight={highlightQuestionId === q.id}
              onChange={(target, patch) => setAnswer(q.id, target, patch)}
            />
          ))
        )}
      </div>
    </div>
  );
}
