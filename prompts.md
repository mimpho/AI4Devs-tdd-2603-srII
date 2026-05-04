# prompts.md

## Referencia principal

1. Plan de pruebas por fases e Historias de Usuario: TEST_PLAN_HU.md
2. Estado actual y pendientes: changelog.md

## Contexto clave derivado de prompts

Resumen de lo importante que se pidio por prompt y que guia este trabajo:

1. Se definieron dos historias de usuario y su alcance:
   - HU1 en frontend (recepcion/envio de datos del formulario).
   - HU2 en backend (recepcion API, validacion y guardado en BD).
2. Se pidio identificar los archivos implicados en ambas HU para mapear el flujo end-to-end.
3. Se confirmo explicitamente la separacion HU1 front / HU2 back para organizar los tests por capas.
4. Se pidio crear un plan de pruebas formal por fases en TEST_PLAN_HU.md.
5. Se pidio crear este prompts.md y mantenerlo vivo durante la implementacion.
6. Se pidio reducir ruido: no usar prompts.md como changelog, dejar solo informacion relevante.
7. Se pidio reflejar unicamente cambios clave de prompt y, en especial, cambios de codigo inducidos por tests.

## Marco de trabajo aplicado (copilot-instructions)

El desarrollo de tests se ejecuta bajo las reglas de `.github/copilot-instructions.md`. Estas reglas **han marcado el flujo de trabajo entre prompt y usuario**, definiendo cómo se estructura cada iteración:

1. Ciclo estricto TDD: Red -> Green -> Refactor.
2. Test mas simple que falle primero.
3. Implementacion minima para pasar.
4. No modificar tests existentes sin aprobacion explicita.
5. Un test a la vez.

## Cambios de codigo inducidos por tests

Registrar aqui solo cambios de implementacion que fueron necesarios para pasar tests.

1. `frontend/src/components/AddCandidateForm.js`
   - Se reemplazo fetch directo por uso de `sendCandidateData`.
   - Se mejoro manejo de errores para leer `error.response.data.message` con fallback seguro.

## Infraestructura/decisiones clave de testing

1. Se mantiene estrategia TDD: Red -> Green -> Refactor, un test a la vez.
2. **Frontend:** Mockeamos `react-datepicker` para controlar fechas deterministicamente y `candidateService.sendCandidateData` para aislar componente.
3. Suite activa: `frontend/src/components/AddCandidateForm.test.js` (7 tests).
4. **Backend:** Se habilito `ts-jest` con config local en `backend/jest.config.js`.
5. **Mocking de Prisma:** Todos los tests de modelos mockean `@prisma/client` antes de importar (Candidate, Education, WorkExperience, Resume). Esto asegura que NO se altera la BD real.
6. Suites activas de HU2 (19 tests):
   - `backend/src/routes/candidateRoutes.test.ts` (3 tests)
   - `backend/src/application/services/candidateService.test.ts` (3 tests)
   - `backend/src/domain/models/Candidate.test.ts` (5 tests)
   - `backend/src/domain/models/Education.test.ts` (3 tests)
   - `backend/src/domain/models/WorkExperience.test.ts` (3 tests)
   - `backend/src/domain/models/Resume.test.ts` (2 tests)

## Alcance

- **Tests unitarios:** Completos (26 tests en verde).
- **Tests e2e:** No implementados (fuera de alcance solicitado).
