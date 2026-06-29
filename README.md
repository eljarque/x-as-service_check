# Verificador XaaS

Herramienta de evaluación para distinguir un servicio que se consume realmente *As-a-Service* de una "colaboración encubierta". Implementa el **Cuestionario XaaS Técnico**: 6 dimensiones (A–F), regla de puerta por pregunta llave, veredicto calculado y mapa de remediación.

## Modelo

| Dim | Tema | Pregunta llave |
|-----|------|----------------|
| A | Contrato | ¿Existe la interfaz como artefacto? |
| B | Versionado y evolución | ¿Se entera el consumidor de cambios que rompen? |
| C | Verificación automática | ¿Se detecta una rotura antes de producción? |
| D | Autoservicio | ¿Puede consumirse solo con la documentación? |
| E | Operación y fiabilidad | ¿Hay SLO y visibilidad del estado? |
| F | Gestión como producto | ¿Se conoce y mide a los consumidores? |

**Regla de puerta:** si la llave de una dimensión es "no", la dimensión se marca roja y se salta el resto.

**Veredictos:** No es XaaS (falla A1 o B1) · XaaS nominal (A bien pero falla C1 o D1) · XaaS sólido (6 llaves en "sí" y C/D mayoritariamente "sí") · XaaS parcial (intermedio).

**Contraste con el consumidor:** las preguntas B1/D1/E2 pueden responderse también desde la perspectiva del consumidor; la app resalta la divergencia.

**Polaridad:** todas las preguntas son binarias sí/no. En algunas (D1, D3) la respuesta "buena" es **no** (marcadas en la UI con "No es lo bueno"); la lógica de puerta y veredicto lo tiene en cuenta.

## Stack

React + TypeScript + Tailwind + Vite. Sin backend: persistencia en `localStorage`, export/import JSON e informe en PDF (Imprimir → Guardar como PDF).

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # build de producción → dist/
npm run preview  # previsualizar el build
```

## Despliegue

Configurado para Netlify (`netlify.toml`): `build` → `dist`, redirect SPA y headers de seguridad.
