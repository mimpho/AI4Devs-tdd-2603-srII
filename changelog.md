# changelog.md

## Propósito

Seguimiento operativo del estado actual, cobertura y pendientes de implementación/tests.

## Estado actual

### HU1 (Frontend)

Estado: cubierto según el plan actual.

Cobertura implementada:
1. Render básico del formulario.
2. Submit a través de servicio de candidatos.
3. Manejo de error backend en UI.
4. Limpieza de mensaje de éxito en fallo posterior.
5. Mapeo de fechas a YYYY-MM-DD en payload.
6. Payload mínimo con arrays vacíos y cv nulo.
7. Inclusión de cv.filePath y cv.fileType tras upload.

### HU2 (Backend)

Estado: completado según alcance de tests unitarios.

Cobertura implementada:
1. POST /candidates retorna 201 en caso exitoso.
2. POST /candidates retorna 400 cuando la capa de servicio lanza Error de validación.
3. POST /candidates retorna 500 ante error no tipado.
4. addCandidate valida datos antes de persistir.
5. addCandidate traduce error Prisma P2002 a mensaje funcional de email duplicado.
6. addCandidate persiste educations/workExperiences/resume con candidateId tras guardar candidate.
7. Candidate.save usa create/update de Prisma con mapeo correcto de payload (incluyendo relaciones en create).
8. Candidate.save lanza error funcional en update cuando P2025 (record no encontrado).
9. Candidate.save lanza error funcional cuando falla conexión BD (PrismaClientInitializationError en create/update).
10. Education.save crea/actualiza registros educativos con/sin candidateId.
11. WorkExperience.save crea/actualiza experiencia laboral con/sin candidateId.
12. Resume.save crea nuevo CV pero lanza error si intenta actualizar existente.

## Resumen final

Proyecto completado según alcance TDD (tests unitarios):
- HU1: 7 tests unitarios ✅
- HU2: 19 tests unitarios ✅
- Total: 26 tests en verde ✅

Validación final ejecutada:
- Frontend: 7/7 tests en verde
- Backend: 19/19 tests en verde

## Decisión de coexistencia de suites

Se mantiene de forma intencional una estrategia dual:

1. Suite consolidada MTT (requisito de entrega del ejercicio):
   - `frontend/src/tests/tests-MTT-frontend.test.js`
   - `backend/src/tests/tests-MTT-backend.test.ts`
2. Suite unitaria por componente/capa (mantenimiento técnico):
   - `frontend/src/components/AddCandidateForm.test.js`
   - `backend/src/routes/candidateRoutes.test.ts`
   - `backend/src/application/services/candidateService.test.ts`
   - `backend/src/domain/models/Candidate.test.ts`
   - `backend/src/domain/models/Education.test.ts`
   - `backend/src/domain/models/WorkExperience.test.ts`
   - `backend/src/domain/models/Resume.test.ts`

Motivación:
- Los consolidados garantizan trazabilidad directa con lo pedido en la entrega.
- Los tests por componente/capa tienen mayor valor para diagnóstico y mantenimiento evolutivo.

Fuera de alcance (no implementado):
- HU2-07: Tests e2e de integración backend
- Edge cases y validaciones en límites

## Cambios de código inducidos por tests

1. frontend/src/components/AddCandidateForm.js
   - Se reemplazó fetch directo por uso de sendCandidateData.
   - Se mejoró manejo de errores para leer error.response.data.message con fallback seguro.

2. backend/package.json
   - Script test actualizado para usar configuración local: jest --config jest.config.js.

3. backend/jest.config.js
   - Configuración de Jest con ts-jest para ejecutar tests TypeScript del backend.

4. frontend/jest.config.js
   - Configuración local de Jest para ejecutar tests unitarios de frontend.

5. frontend/babel.config.js
   - Configuración de Babel para transformar JSX durante la ejecución de tests en frontend.
