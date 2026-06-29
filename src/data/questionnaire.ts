import type { Dimension } from '../types';

/**
 * Cuestionario XaaS Técnico. Seis dimensiones A→F; el orden importa: cada
 * dimensión presupone la anterior. Cada dimensión tiene una pregunta "llave"
 * (isKey); si la llave es "no", se aplica la regla de puerta (ver lib/verdict).
 * Las preguntas de contraste (isContrast) se plantean también al consumidor.
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
        text: 'Si yo fuera un equipo nuevo que quiere consumir vuestro servicio, ¿hay algún documento donde pueda ver exactamente qué ofrece y cómo llamarlo?',
        hint: 'Si A1 es "no": parad aquí la dimensión. Anótala como roja y dimensiona el gap.',
      },
      {
        id: 'A2',
        text: '¿Ese documento está en un formato estándar, tipo OpenAPI o AsyncAPI, o es un documento libre?',
      },
      {
        id: 'A3',
        text: '¿Quién lo mantiene al día cuando el servicio cambia? ¿Cómo sabéis que no está desactualizado?',
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
        text: 'Cuando cambiáis algo del servicio, ¿cómo se entera un consumidor de si ese cambio le puede romper algo?',
      },
      {
        id: 'B2',
        text: '¿Usáis números de versión que distingan cambios compatibles de incompatibles?',
        hint: 'Semantic versioning.',
      },
      {
        id: 'B3',
        text: 'Cuando hacéis un cambio que rompe compatibilidad, ¿conviven la versión vieja y la nueva durante un tiempo, o todos los consumidores tienen que migrar a la vez?',
        hint: 'Two in Production.',
      },
      {
        id: 'B4',
        text: '¿Habéis retirado alguna vez una versión antigua? ¿Cómo fue: con fecha anunciada y plazo, o apagándola y a ver quién grita?',
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
        text: 'Si mañana alguien de vuestro equipo cambia un campo de la respuesta sin querer, ¿algo automático lo detecta antes de llegar a producción, o lo detecta el consumidor cuando ya está roto?',
      },
      {
        id: 'C2',
        text: '¿Tenéis tests de contrato, con Pact o similar, o algo que compare la especificación entre versiones?',
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
        text: 'Pensad en el último equipo que empezó a consumir vuestro servicio: ¿cuántas reuniones, correos o tickets necesitó hasta hacer su primera llamada con éxito?',
        hint: 'Responde "sí" si fueron pocos/ninguno (autoservicio real), "no" si necesitó mucha coordinación.',
      },
      {
        id: 'D2',
        isContrast: true,
        text: '¿Podría haberlo hecho sin hablar con vosotros, solo con la documentación?',
      },
      {
        id: 'D3',
        text: 'En el día a día, ¿cuántas dudas os llegan por canales informales (Teams, pasillo) sobre cómo usar el servicio?',
        hint: 'Termómetro: mucho tráfico informal = la interacción real es colaboración, no XaaS. Responde "sí" si es poco/ninguno.',
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
      },
      {
        id: 'E2',
        isContrast: true,
        text: 'Si el servicio se degrada ahora mismo, ¿quién se entera antes: vosotros o un consumidor quejándose?',
        hint: 'Responde "sí" si os enteráis vosotros primero (monitorización propia).',
      },
      {
        id: 'E3',
        text: '¿Los consumidores pueden ver el estado del servicio por sí mismos (dashboard, página de estado)?',
      },
      {
        id: 'E4',
        text: 'Cuando hay una incidencia, ¿hay un canal y un responsable claros, o se resuelve por quien pille el mensaje?',
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
        text: '¿Sabéis quiénes son todos vuestros consumidores y qué versión usa cada uno?',
      },
      {
        id: 'F2',
        text: '¿Medís el uso del servicio (qué endpoints, cuánto, por quién)?',
      },
      {
        id: 'F3',
        text: 'Cuando un consumidor pide un cambio, ¿hay un proceso para priorizarlo, o depende de quién lo pida y cuánto insista?',
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
