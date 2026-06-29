import { useCallback, useEffect, useRef, useState } from 'react';
import type { Answer, Assessment, AnswerValue } from '../types';
import { createEmptyAssessment, loadLocal, saveLocal } from '../lib/storage';

type Side = 'provider' | 'consumer';

export function useAssessment() {
  const [assessment, setAssessment] = useState<Assessment>(() => loadLocal() ?? createEmptyAssessment());
  const firstRender = useRef(true);

  // Autosave a localStorage en cada cambio (salvo el render inicial).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveLocal(assessment);
  }, [assessment]);

  const touch = (a: Assessment): Assessment => ({ ...a, updatedAt: new Date().toISOString() });

  const setMeta = useCallback((patch: Partial<Assessment>) => {
    setAssessment((a) => touch({ ...a, ...patch }));
  }, []);

  const setAnswer = useCallback(
    (questionId: string, side: Side, patch: Partial<Answer>) => {
      setAssessment((a) => {
        const existing = a.answers[questionId] ?? { provider: { value: 'na' as AnswerValue, notes: '' } };
        const current: Answer = existing[side] ?? { value: 'na', notes: '' };
        const nextSide: Answer = { ...current, ...patch };
        return touch({
          ...a,
          answers: { ...a.answers, [questionId]: { ...existing, [side]: nextSide } },
        });
      });
    },
    [],
  );

  const replace = useCallback((a: Assessment) => {
    setAssessment(touch(a));
  }, []);

  const reset = useCallback(() => {
    setAssessment(createEmptyAssessment());
  }, []);

  return { assessment, setMeta, setAnswer, replace, reset };
}
