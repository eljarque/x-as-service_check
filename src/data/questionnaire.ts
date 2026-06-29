import type { Dimension } from '../types';

/**
 * Cuestionario XaaS Técnico. Seis dimensiones A→F; el orden importa: cada
 * dimensión presupone la anterior. La primera pregunta de cada dimensión es la
 * "llave" (isKey); si la llave da su respuesta "mala", se aplica la regla de
 * puerta (ver lib/verdict). Todas las preguntas son binarias sí/no con notas
 * aclaratorias opcionales. Las preguntas de contraste (isContrast) se plantean
 * también al consumidor. Las marcadas con invert tienen la polaridad al revés:
 * la respuesta "buena" es "no".
 */
export const QUESTIONNAIRE: Dimension[] = [
  {
    id: 'A',
    title: 'Contrato',
    intro: '¿Existe la interfaz como artefacto? Sin contrato no hay XaaS; hay acoplamiento informal.',
    questions: [
      {
        id: 'A1',
        isKey: true,
        text: 'Si un equipo nuevo quiere consumir vuestro servicio, ¿existe un documento donde pueda ver exactamente qué ofrece y cómo consumirlo?',
        hint: 'Si A1 es "no": parad aquí la dimensión. Anótala como roja y dimensiona el gap.',
      },
      {
        id: 'A2',
        text: '¿Ese documento sigue un estándar tipo OpenAPI o AsyncAPI?',
        hint: 'Si se trata de un documento libre (no estándar), indícalo en las notas.',
      },
      {
        id: 'A3',
        text: '¿Se ha designado a un responsable de mantener al día el documento cuando se producen cambios en el servicio?',
      },
      {
        id: 'A4',
        text: '¿Existe algún mecanismo implementado que permita determinar con facilidad, y sin riesgo de error, que el documento está actualizado?',
      },
    ],
  },
  {
    id: 'B',
    title: 'Versionado y evolución',
    questions: [
      {
        id: 'B1',
        isKey: true,
        isContrast: true,
        text: '¿Se enteran los consumidores de los cambios introducidos en el servicio antes de que les rompan algo?',
      },
      {
        id: 'B2',
        text: '¿Usáis números de versión que distingan cambios compatibles de incompatibles?',
        hint: 'Si usáis Semantic Versioning (versionado semántico estándar), indicadlo en las notas.',
      },
      {
        id: 'B3',
        text: 'Cuando hacéis un cambio que rompe compatibilidad, ¿conviven la versión vieja y la nueva durante un tiempo?',
        hint: 'Si todos los consumidores tienen que migrar a la vez, indícalo en las notas.',
      },
      {
        id: 'B4',
        text: 'Cuando habéis retirado una versión antigua, ¿se hizo con fecha y plazo anunciados con antelación suficiente para que los equipos consumidores pudieran prepararse?',
      },
    ],
  },
  {
    id: 'C',
    title: 'Verificación automática',
    questions: [
      {
        id: 'C1',
        isKey: true,
        text: 'Si alguien de vuestro equipo cambia un campo de la respuesta sin querer, ¿algo automático lo detecta antes de llegar a producción?',
      },
      {
        id: 'C2',
        text: '¿Tenéis tests de contrato (con Pact o similar) o algo que compare la especificación entre versiones?',
      },
      {
        id: 'C3',
        text: '¿Los consumidores tienen algún entorno o stub contra el que probar sin pediros nada?',
      },
    ],
  },
  {
    id: 'D',
    title: 'Autoservicio del consumidor',
    questions: [
      {
        id: 'D1',
        isKey: true,
        isContrast: true,
        invert: true,
        text: 'Pensad en el último equipo que empezó a consumir vuestro servicio: ¿necesitó soporte en tiempo real (reuniones cara a cara, correos, tickets) para hacer su primera llamada con éxito?',
        hint: 'El objetivo es que el desarrollador pueda operar solo con la documentación. Si necesitó soporte en tiempo real → "sí" (mal).',
      },
      {
        id: 'D3',
        invert: true,
        text: 'Una vez implementado el servicio, ¿os llegan muchas dudas informales (Teams, pasillo) sobre cómo usarlo?',
        hint: 'Termómetro: mucho tráfico informal puede señalar deficiencias en la documentación. Cuantifica las dudas en las notas.',
      },
    ],
  },
  {
    id: 'E',
    title: 'Operación y fiabilidad',
    questions: [
      {
        id: 'E1',
        isKey: true,
        text: '¿Habéis acordado con los consumidores qué disponibilidad o tiempo de respuesta pueden esperar, aunque sea informalmente?',
        hint: 'Si habéis acordado la disponibilidad o el tiempo de respuesta, indicadlo en las notas.',
      },
      {
        id: 'E2',
        isContrast: true,
        text: 'Si el servicio se degradase ahora mismo, ¿seríais los primeros en saberlo (antes que un consumidor quejándose)?',
      },
      {
        id: 'E3',
        text: '¿Los consumidores pueden ver el estado del servicio por sí mismos (dashboard, página de estado)?',
      },
      {
        id: 'E4',
        text: 'Cuando hay una incidencia, ¿existe un canal de comunicación claro?',
      },
      {
        id: 'E5',
        text: 'Cuando hay una incidencia, ¿hay un responsable designado para su resolución?',
      },
    ],
  },
  {
    id: 'F',
    title: 'Gestión como producto',
    questions: [
      {
        id: 'F1',
        isKey: true,
        text: '¿Sabéis quiénes son todos vuestros consumidores y qué endpoints/versión usa cada uno?',
      },
      {
        id: 'F2',
        text: '¿Medís el uso del servicio (qué endpoints, cuánto, por quién)?',
      },
      {
        id: 'F3',
        text: 'Cuando un consumidor pide un cambio, ¿hay un proceso implementado para priorizarlo, independientemente de quién lo pida?',
      },
    ],
  },
];

export const DIMENSION_BY_ID = Object.fromEntries(
  QUESTIONNAIRE.map((d) => [d.id, d]),
) as Record<string, Dimension>;

/** Todas las preguntas marcadas como contraste (se preguntan al consumidor). */
export const CONTRAST_QUESTION_IDS = QUESTIONNAIRE.flatMap((d) =>
  d.questions.filter((q) => q.isContrast).map((q) => q.id),
);

export function questionById(id: string) {
  for (const d of QUESTIONNAIRE) {
    const q = d.questions.find((q) => q.id === id);
    if (q) return q;
  }
  return undefined;
}

export function keyQuestion(dimensionId: string) {
  return DIMENSION_BY_ID[dimensionId]?.questions.find((q) => q.isKey);
}
