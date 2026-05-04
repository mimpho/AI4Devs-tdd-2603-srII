# changelog.md

## Proposito

Seguimiento operativo del estado actual, cobertura y pendientes de implementacion/tests.

## Estado actual

### HU1 (Frontend)

Estado: cubierto segun el plan actual.

Cobertura implementada:
1. Render basico del formulario.
2. Submit a traves de servicio de candidatos.
3. Manejo de error backend en UI.
4. Limpieza de mensaje de exito en fallo posterior.
5. Mapeo de fechas a YYYY-MM-DD en payload.
6. Payload minimo con arrays vacios y cv nulo.
7. Inclusion de cv.filePath y cv.fileType tras upload.

### HU2 (Backend)

Estado: completado segun alcance de tests unitarios.

Cobertura implementada:
1. POST /candidates retorna 201 en caso exitoso.
2. POST /candidates retorna 400 cuando la capa de servicio lanza Error de validacion.
3. POST /candidates retorna 500 ante error no tipado.
4. addCandidate valida datos antes de persistir.
5. addCandidate traduce error Prisma P2002 a mensaje funcional de email duplicado.
6. addCandidate persiste educations/workExperiences/resume con candidateId tras guardar candidate.
7. Candidate.save usa create/update de Prisma con mapeo correcto de payload (incluyendo relaciones en create).
8. Candidate.save lanza error funcional en update cuando P2025 (record no encontrado).
9. Candidate.save lanza error funcional cuando falla conexion BD (PrismaClientInitializationError en create/update).
10. Education.save crea/actualiza registros educativos con/sin candidateId.
11. WorkExperience.save crea/actualiza experiencia laboral con/sin candidateId.
12. Resume.save crea nuevo CV pero lanza error si intenta actualizar existente.

## Resumen final

Proyecto completado segun alcance TDD (tests unitarios):
- HU1: 7 tests unitarios ✅
- HU2: 19 tests unitarios ✅
- Total: 26 tests en verde ✅

Fuera de alcance (no implementado):
- HU2-07: Tests e2e de integracion backend
- Edge cases y validaciones en limites

## Cambios de codigo inducidos por tests

1. frontend/src/components/AddCandidateForm.js
   - Se reemplazo fetch directo por uso de sendCandidateData.
   - Se mejoro manejo de errores para leer error.response.data.message con fallback seguro.

2. backend/package.json
   - Script test actualizado para usar configuracion local: jest --config jest.config.js.

3. backend/jest.config.js
   - Configuracion de Jest con ts-jest para ejecutar tests TypeScript del backend.
