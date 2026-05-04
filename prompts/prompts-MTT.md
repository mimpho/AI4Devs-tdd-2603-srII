# prompts-MTT.md

## Referencia principal

1. Plan de pruebas por fases e Historias de Usuario: [TEST_PLAN_HU.md](../TEST_PLAN_HU.md)
2. Estado actual y pendientes: [changelog.md](../changelog.md)
3. Tests consolidados de entrega:
   - Frontend: [frontend/src/tests/tests-MTT-frontend.test.js](../frontend/src/tests/tests-MTT-frontend.test.js)
   - Backend: [backend/src/tests/tests-MTT-backend.test.ts](../backend/src/tests/tests-MTT-backend.test.ts)
4. Tests unitarios por componente/capa (mantenimiento):
   - Frontend: [frontend/src/components/AddCandidateForm.test.js](../frontend/src/components/AddCandidateForm.test.js)
   - Backend (ruta/servicio/modelos):
     - [backend/src/routes/candidateRoutes.test.ts](../backend/src/routes/candidateRoutes.test.ts)
     - [backend/src/application/services/candidateService.test.ts](../backend/src/application/services/candidateService.test.ts)
     - [backend/src/domain/models/Candidate.test.ts](../backend/src/domain/models/Candidate.test.ts)
     - [backend/src/domain/models/Education.test.ts](../backend/src/domain/models/Education.test.ts)
     - [backend/src/domain/models/WorkExperience.test.ts](../backend/src/domain/models/WorkExperience.test.ts)
     - [backend/src/domain/models/Resume.test.ts](../backend/src/domain/models/Resume.test.ts)

## Contexto clave derivado de prompts

Resumen de lo importante que se pidió por prompt y que guía este trabajo:

1. Se definieron dos historias de usuario y su alcance:
   - HU1 en frontend (recepción/envío de datos del formulario).
   - HU2 en backend (recepción API, validación y guardado en BD).
2. Se pidió identificar los archivos implicados en ambas HU para mapear el flujo end-to-end.
3. Se confirmó explícitamente la separación HU1 front / HU2 back para organizar los tests por capas.
4. Se pidió crear un plan de pruebas formal por fases en TEST_PLAN_HU.md.
5. Se pidió crear archivos de tests separados por capas:
   - `frontend/src/tests/tests-MTT-frontend.test.js` para HU1 (7 tests)
   - `backend/src/tests/tests-MTT-backend.test.ts` para HU2 (19 tests)
6. Se pidió crear este archivo de prompts en la carpeta `prompts/prompts-MTT.md`.
7. Se pidió reflejar únicamente cambios clave de prompt y, en especial, cambios de código inducidos por tests.

## Marco de trabajo aplicado (copilot-instructions)

El desarrollo de tests se ejecuta bajo las reglas de `.github/copilot-instructions.md`. Estas reglas **han marcado el flujo de trabajo entre prompt y usuario**, definiendo cómo se estructura cada iteración:

1. Ciclo estricto TDD: Red -> Green -> Refactor.
2. Test más simple que falle primero.
3. Implementación mínima para pasar.
4. No modificar tests existentes sin aprobación explícita.
5. Un test a la vez.

## Cambios de código inducidos por tests

Registrar aquí solo cambios de implementación que fueron necesarios para pasar tests.

1. `frontend/src/components/AddCandidateForm.js`
   - Se reemplazó fetch directo por uso de `sendCandidateData`.
   - Se mejoró manejo de errores para leer `error.response.data.message` con fallback seguro.

2. `frontend/package.json`
   - Se agregó dependencia `axios` (necesaria para `candidateService.sendCandidateData`).

3. `frontend/jest.config.js`
   - Se añadió configuración local de Jest para ejecutar la suite unitaria de frontend.

4. `frontend/babel.config.js`
   - Se añadió configuración de Babel para transformar JSX en tests de frontend.

## Infraestructura/decisiones clave de testing

1. Se mantiene estrategia TDD: Red -> Green -> Refactor, un test a la vez.
2. **Tests separados por capas:**
   - `frontend/src/tests/tests-MTT-frontend.test.js` - 7 tests de HU1
   - `backend/src/tests/tests-MTT-backend.test.ts` - 19 tests de HU2
3. **Frontend (7 tests):**
   - Mockeamos `react-datepicker` para controlar fechas determinísticamente
   - Mockeamos `candidateService.sendCandidateData` para aislar componente
   - Se ejecutan con configuración local (`frontend/jest.config.js` + `frontend/babel.config.js`)
   - Cobertura: render, submit, errores, transformación de datos, CV
4. **Backend (19 tests):**
   - Se habilitó `ts-jest` con config local en `backend/jest.config.js`
   - 3 tests de rutas HTTP (201, 400, 500)
   - 3 tests de servicio (validación, P2002, persistencia relaciones)
   - 13 tests de modelos (Candidate, Education, WorkExperience, Resume)
   - Mocking de `@prisma/client` asegura que NO se altera la BD real

## Criterio de coexistencia de suites

1. Se mantienen los tests consolidados MTT porque son los requeridos para la entrega del ejercicio.
2. Se mantienen también los tests unitarios por componente/capa porque son más útiles para mantenimiento, depuración y evolución del código.
3. La coexistencia es intencional y documentada: no implica reemplazo de una estrategia por la otra.
4. En ejecución de Jest se detectan ambas suites; esto es esperado mientras se mantenga este criterio.

## Alcance

- **Tests unitarios:** Completos (26 tests en verde, separados por capas)
- **Validación final ejecutada:**
   - Frontend: 7/7 tests en verde
   - Backend: 19/19 tests en verde
- **Tests e2e:** No implementados (fuera de alcance solicitado)
- **Estructura de archivos:**
   - Suite consolidada de entrega:
      - `frontend/src/tests/tests-MTT-frontend.test.js` - 7 tests de HU1
      - `backend/src/tests/tests-MTT-backend.test.ts` - 19 tests de HU2
   - Suite unitaria por componente/capa (coexistente):
      - `frontend/src/components/AddCandidateForm.test.js`
      - `backend/src/routes/candidateRoutes.test.ts`
      - `backend/src/application/services/candidateService.test.ts`
      - `backend/src/domain/models/Candidate.test.ts`
      - `backend/src/domain/models/Education.test.ts`
      - `backend/src/domain/models/WorkExperience.test.ts`
      - `backend/src/domain/models/Resume.test.ts`
  - `prompts/prompts-MTT.md` - Este archivo con contexto de prompts y decisiones
  - Otros archivos de documentación: `TEST_PLAN_HU.md`, `changelog.md`
