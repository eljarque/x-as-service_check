import { useCallback, useEffect, useRef, useState } from 'react';
import type { Answer, AnswerTarget, AnswerValue, Assessment } from '../types';
import { createEmptyAssessment, loadLocal, saveLocal } from '../lib/storage';

const emptyAnswer = (): Answer => ({ value: 'na' as AnswerValue, notes: '' });

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

  const setAnswer = useCallback((questionId: string, target: AnswerTarget, patch: Partial<Answer>) => {
    setAssessment((a) => {
      const existing = a.answers[questionId] ?? { provider: emptyAnswer() };
      if (target === 'provider') {
        const next = { ...(existing.provider ?? emptyAnswer()), ...patch };
        return touch({ ...a, answers: { ...a.answers, [questionId]: { ...existing, provider: next } } });
      }
      const consumers = { ...(existing.consumers ?? {}) };
      consumers[target.consumerTeamId] = { ...(consumers[target.consumerTeamId] ?? emptyAnswer()), ...patch };
      return touch({ ...a, answers: { ...a.answers, [questionId]: { ...existing, consumers } } });
    });
  }, []);

  const addConsumerTeam = useCallback((name: string) => {
    setAssessment((a) =>
      touch({ ...a, consumerTeams: [...a.consumerTeams, { id: crypto.randomUUID(), name }] }),
    );
  }, []);

  const renameConsumerTeam = useCallback((id: string, name: string) => {
    setAssessment((a) =>
      touch({ ...a, consumerTeams: a.consumerTeams.map((t) => (t.id === id ? { ...t, name } : t)) }),
    );
  }, []);

  const removeConsumerTeam = useCallback((id: string) => {
    setAssessment((a) => {
      // Limpia también las respuestas de ese consumidor en todas las preguntas.
      const answers: Assessment['answers'] = {};
      for (const [qid, qa] of Object.entries(a.answers)) {
        if (!qa.consumers || !(id in qa.consumers)) {
          answers[qid] = qa;
          continue;
        }
        const { [id]: _removed, ...rest } = qa.consumers;
        answers[qid] = { ...qa, consumers: Object.keys(rest).length ? rest : undefined };
      }
      return touch({ ...a, consumerTeams: a.consumerTeams.filter((t) => t.id !== id), answers });
    });
  }, []);

  const replace = useCallback((a: Assessment) => {
    setAssessment(touch(a));
  }, []);

  const reset = useCallback(() => {
    setAssessment(createEmptyAssessment());
  }, []);

  return { assessment, setMeta, setAnswer, addConsumerTeam, renameConsumerTeam, removeConsumerTeam, replace, reset };
}
