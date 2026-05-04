# Plan de tests para HU1 y HU2 (TDD)

## Objetivo

Definir un plan incremental de pruebas para las dos historias de usuario, siguiendo el ciclo TDD:

1. Red: escribir un test que falle.
2. Green: implementar el mínimo para que pase.
3. Refactor: mejorar sin cambiar comportamiento.

## Alcance

- HU1 (Frontend): recepción y envío de datos desde formulario de alta de candidato.
- HU2 (Backend): recepción API, validación y guardado en base de datos.

## Plan HU1 (Frontend)

### Fase 1: Payload y transformaciones

1. Red: test que verifica mapping de Date a YYYY-MM-DD antes de enviar.
2. Green: ajustar mapping en handleSubmit.
3. Refactor: extraer helper puro mapCandidateToPayload para testear sin UI.

### Fase 2: Variantes de envío

1. Red: test con arrays vacíos y CV nulo.
2. Green: enviar payload sin romper contrato.
3. Refactor: normalizar valores por defecto.

### Fase 3: CV en payload

1. Red: test que verifica inclusión de filePath/fileType cuando existe CV.
2. Green: ajustar construcción de candidateData.
3. Refactor: evitar lógica duplicada en construcción de payload.

### Fase 4: Robustez UI

1. Red: test de doble submit (evitar estados inconsistentes).
2. Green: actualizar estado UI correctamente.
3. Refactor: simplificar manejo success/error.

## Plan HU2 (Backend)

### Fase 1: Ruta HTTP /candidates

1. Red: test de POST /candidates que retorna 201 cuando servicio responde OK.
2. Green: implementar respuesta esperada en route.
3. Refactor: limpiar manejo de errores HTTP.

1. Red: test de POST /candidates que retorna 400 ante error de validación.
2. Green: propagar mensaje de error controlado.
3. Refactor: estandarizar shape de respuesta de error.

### Fase 2: Servicio de aplicación addCandidate

1. Red: test que valida llamada a validateCandidateData.
2. Green: invocar validación antes de persistencia.
3. Refactor: separar responsabilidad de validación y guardado.

1. Red: test que guarda candidato principal y luego entidades relacionadas.
2. Green: guardar candidate, luego educations/workExperiences/resume.
3. Refactor: extraer funciones saveEducations, saveWorkExperiences, saveResume.

1. Red: test para error de email duplicado (P2002) con mensaje de negocio.
2. Green: mapear error técnico a mensaje funcional.
3. Refactor: helper de traducción de errores Prisma.

### Fase 3: Modelo de dominio y Prisma

1. Red: test de Candidate.save create con payload mínimo.
2. Green: crear candidate con prisma.candidate.create.
3. Refactor: construir candidateData en metodo separado.

1. Red: test de Candidate.save update cuando existe id.
2. Green: actualizar con prisma.candidate.update.
3. Refactor: consolidar rutas create/update.

1. Red: tests de error en Candidate.save (P2025 y PrismaClientInitializationError).
2. Green: manejo de errores con mensajes funcionales.
3. Refactor: mejora de verificación de tipo de error.

1. Red: tests de Education/WorkExperience/Resume save.
2. Green: persistencia de cada entidad relacionada (create/update).
3. Refactor: consistencia de errores y tipado.

## Priorización recomendada

1. HU1 - completar mapping de fechas y variantes de payload.
2. HU2 - ruta POST /candidates (contrato HTTP).
3. HU2 - servicio addCandidate (validación + orquestación de guardado).
4. HU2 - modelos de dominio con Prisma.

## Notas de ejecución

- Ejecutar un test a la vez para respetar TDD real.
- Hacer commits pequeños por cada ciclo Red/Green/Refactor completado.
- Evitar modificar tests existentes sin aprobación explícita.
- Mockear todas las dependencias externas (Prisma, servicios, módulos) para aislar tests.
- El estado y progreso se refleja en changelog.md, no en este documento.
