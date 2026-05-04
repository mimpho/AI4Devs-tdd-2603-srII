/**
 * Tests MTT - Backend
 * 
 * Contiene 19 tests unitarios para HU2 (Backend)
 * Estructura: Rutas HTTP (3) + Servicio (3) + Modelos de dominio (13)
 * 
 * Estrategia de mocking:
 * - Mockeamos SOLO @prisma/client y el controller
 * - Usamos modelos reales que creerán/actualizarán via PrismaClient mockeado
 * - Esto permite verificar que los modelos llaman a Prisma correctamente
 */

// ============================================================================
// MOCKS GLOBALES (antes de cualquier import)
// ============================================================================

const mockCandidateCreate = jest.fn();
const mockCandidateUpdate = jest.fn();
const mockEducationCreate = jest.fn();
const mockEducationUpdate = jest.fn();
const mockWorkExperienceCreate = jest.fn();
const mockWorkExperienceUpdate = jest.fn();
const mockResumeCreate = jest.fn();

let PrismaClientInitializationErrorClass: any;

jest.mock('@prisma/client', () => {
  class PrismaClient {
    candidate = {
      create: mockCandidateCreate,
      update: mockCandidateUpdate,
    };
    education = {
      create: mockEducationCreate,
      update: mockEducationUpdate,
    };
    workExperience = {
      create: mockWorkExperienceCreate,
      update: mockWorkExperienceUpdate,
    };
    resume = {
      create: mockResumeCreate,
    };
  }

  class PrismaClientInitializationError extends Error {
    constructor(message: string, version: string) {
      super(message);
      this.name = 'PrismaClientInitializationError';
    }
  }

  PrismaClientInitializationErrorClass = PrismaClientInitializationError;

  return {
    PrismaClient,
    Prisma: {
      PrismaClientInitializationError,
    },
  };
});

jest.mock('../presentation/controllers/candidateController', () => ({
  addCandidate: jest.fn(),
}));

jest.mock('../application/validator', () => ({
  validateCandidateData: jest.fn(),
}));

// ============================================================================
// IMPORTS (después de mocks, esto garantiza que los mocks estén activos)
// ============================================================================

import express from 'express';
import request from 'supertest';
import router from '../routes/candidateRoutes';
import { addCandidate } from '../presentation/controllers/candidateController';
import { addCandidate as addCandidateService } from '../application/services/candidateService';
import { validateCandidateData } from '../application/validator';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

describe('HU2 - Backend Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Routes: POST /candidates', () => {
    it('returns 201 and candidate data when creation succeeds', async () => {
      const app = express();
      app.use(express.json());
      app.use('/candidates', router);

      const payload = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      };

      const createdCandidate = {
        id: 1,
        ...payload,
      };

      (addCandidate as jest.Mock).mockResolvedValue(createdCandidate);

      const response = await request(app).post('/candidates').send(payload);

      expect(addCandidate).toHaveBeenCalledWith(payload);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdCandidate);
    });

    it('returns 400 with error message when addCandidate throws an Error', async () => {
      const app = express();
      app.use(express.json());
      app.use('/candidates', router);

      const payload = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'invalid-email',
      };

      (addCandidate as jest.Mock).mockRejectedValue(new Error('Invalid email'));

      const response = await request(app).post('/candidates').send(payload);

      expect(addCandidate).toHaveBeenCalledWith(payload);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid email' });
    });

    it('returns 500 when addCandidate throws a non-Error value', async () => {
      const app = express();
      app.use(express.json());
      app.use('/candidates', router);

      const payload = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      };

      (addCandidate as jest.Mock).mockRejectedValue('unexpected');

      const response = await request(app).post('/candidates').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'An unexpected error occurred' });
    });
  });

  describe('Service: addCandidate', () => {
    it('validates candidate data before any persistence', async () => {
      const candidateData = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await expect(addCandidateService(candidateData)).rejects.toThrow('Validation failed');
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
    });

    it('maps prisma P2002 error to duplicate email message', async () => {
      const candidateData = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => undefined);
      mockCandidateCreate.mockRejectedValue({ code: 'P2002' });

      await expect(addCandidateService(candidateData)).rejects.toThrow('The email already exists in the database');
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
    });

    it('persists related education, workExperience and resume with saved candidateId', async () => {
      const candidateData = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        educations: [
          {
            institution: 'UC3M',
            title: 'Computer Science',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
          },
        ],
        workExperiences: [
          {
            company: 'Acme',
            position: 'Developer',
            description: 'Backend dev',
            startDate: '2024-02-01',
            endDate: '2025-01-01',
          },
        ],
        cv: {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      };

      const savedCandidate = { id: 123, firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' };

      (validateCandidateData as jest.Mock).mockImplementation(() => undefined);
      mockCandidateCreate.mockResolvedValue(savedCandidate);
      mockEducationCreate.mockResolvedValue({ id: 1, candidateId: 123 });
      mockWorkExperienceCreate.mockResolvedValue({ id: 1, candidateId: 123 });
      mockResumeCreate.mockResolvedValue({ id: 1, candidateId: 123 });

      const result = await addCandidateService(candidateData);

      expect(result).toEqual(savedCandidate);
      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      expect(mockCandidateCreate).toHaveBeenCalledTimes(1);
      expect(mockEducationCreate).toHaveBeenCalledTimes(1);
      expect(mockWorkExperienceCreate).toHaveBeenCalledTimes(1);
      expect(mockResumeCreate).toHaveBeenCalledTimes(1);

      expect(mockCandidateCreate.mock.invocationCallOrder[0]).toBeLessThan(
        mockEducationCreate.mock.invocationCallOrder[0]
      );
    });
  });

  describe('Models: Candidate', () => {
    it('creates a new candidate with Prisma.candidate.create', async () => {
      const payload = {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      };

      const created = { id: 1, firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' };
      mockCandidateCreate.mockResolvedValue(created);

      const candidate = new Candidate(payload);
      const result = await candidate.save();

      expect(mockCandidateCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Ana',
          lastName: 'Lopez',
          email: 'ana@example.com',
        }),
      });
      expect(result).toEqual(created);
    });

    it('updates an existing candidate using Prisma.candidate.update', async () => {
      const updated = { id: 99, firstName: 'Updated', lastName: 'Lopez', email: 'updated@example.com' };
      mockCandidateUpdate.mockResolvedValue(updated);

      const candidate = new Candidate({
        id: 99,
        firstName: 'Updated',
        lastName: 'Lopez',
        email: 'updated@example.com',
      });

      const result = await candidate.save();

      expect(mockCandidateUpdate).toHaveBeenCalledWith({
        where: { id: 99 },
        data: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });

    it('throws functional message on P2025 (record not found) error', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';
      mockCandidateUpdate.mockRejectedValue(error);

      const candidate = new Candidate({
        id: 999,
        firstName: 'NonExistent',
        lastName: 'User',
        email: 'nonexistent@example.com',
      });

      await expect(candidate.save()).rejects.toThrow(
        'No se pudo encontrar el registro del candidato con el ID proporcionado.'
      );
    });

    it('throws database connection error on PrismaClientInitializationError in update', async () => {
      const error = new PrismaClientInitializationErrorClass('Connection failed', '0.0.1');
      mockCandidateUpdate.mockRejectedValue(error);

      const candidate = new Candidate({
        id: 99,
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      });

      await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos');
    });

    it('throws database connection error on PrismaClientInitializationError in create', async () => {
      const error = new PrismaClientInitializationErrorClass('Connection failed', '0.0.1');
      mockCandidateCreate.mockRejectedValue(error);

      const candidate = new Candidate({
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
      });

      await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos');
    });
  });

  describe('Models: Education', () => {
    it('creates a new education record', async () => {
      const created = { id: 1, institution: 'UC3M', title: 'CS', candidateId: null };
      mockEducationCreate.mockResolvedValue(created);

      const education = new Education({
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
      });

      const result = await education.save();

      expect(mockEducationCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          institution: 'UC3M',
          title: 'Computer Science',
        }),
      });
      expect(result).toEqual(created);
    });

    it('includes candidateId when provided', async () => {
      const created = { id: 2, institution: 'UPM', title: 'EE', candidateId: 10 };
      mockEducationCreate.mockResolvedValue(created);

      const education = new Education({
        institution: 'UPM',
        title: 'Electrical Engineering',
        startDate: new Date('2021-01-01'),
        candidateId: 10,
      });

      const result = await education.save();

      expect(mockEducationCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 10,
        }),
      });
      expect(result).toEqual(created);
    });

    it('updates existing education record', async () => {
      const updated = { id: 5, institution: 'Updated', title: 'Updated Title', candidateId: 10 };
      mockEducationUpdate.mockResolvedValue(updated);

      const education = new Education({
        id: 5,
        institution: 'Updated',
        title: 'Updated Title',
        startDate: new Date('2020-01-01'),
        candidateId: 10,
      });

      const result = await education.save();

      expect(mockEducationUpdate).toHaveBeenCalledWith({
        where: { id: 5 },
        data: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });
  });

  describe('Models: WorkExperience', () => {
    it('creates a new work experience record', async () => {
      const created = { id: 1, company: 'Acme', position: 'Developer', candidateId: null };
      mockWorkExperienceCreate.mockResolvedValue(created);

      const workExp = new WorkExperience({
        company: 'Acme',
        position: 'Developer',
        startDate: new Date('2024-01-01'),
      });

      const result = await workExp.save();

      expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          company: 'Acme',
          position: 'Developer',
        }),
      });
      expect(result).toEqual(created);
    });

    it('includes candidateId when provided', async () => {
      const created = { id: 2, company: 'TechCorp', position: 'Senior Dev', candidateId: 15 };
      mockWorkExperienceCreate.mockResolvedValue(created);

      const workExp = new WorkExperience({
        company: 'TechCorp',
        position: 'Senior Dev',
        startDate: new Date('2023-06-01'),
        candidateId: 15,
      });

      const result = await workExp.save();

      expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 15,
        }),
      });
      expect(result).toEqual(created);
    });

    it('updates existing work experience record', async () => {
      const updated = { id: 10, company: 'UpdatedCorp', position: 'Lead Dev', candidateId: 20 };
      mockWorkExperienceUpdate.mockResolvedValue(updated);

      const workExp = new WorkExperience({
        id: 10,
        company: 'UpdatedCorp',
        position: 'Lead Dev',
        startDate: new Date('2023-01-01'),
        candidateId: 20,
      });

      const result = await workExp.save();

      expect(mockWorkExperienceUpdate).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.any(Object),
      });
      expect(result).toEqual(updated);
    });
  });

  describe('Models: Resume', () => {
    it('creates a new resume record', async () => {
      const created = { id: 1, candidateId: 5, filePath: 'uploads/cv.pdf', fileType: 'application/pdf' };
      mockResumeCreate.mockResolvedValue(created);

      const resume = new Resume({
        candidateId: 5,
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
      });

      const result = await resume.save();

      expect(mockResumeCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          candidateId: 5,
          filePath: 'uploads/cv.pdf',
        }),
      });
      expect(result.filePath).toEqual('uploads/cv.pdf');
    });

    it('throws error when trying to update an existing resume', async () => {
      const resume = new Resume({
        id: 1,
        candidateId: 5,
        filePath: 'uploads/cv_old.pdf',
        fileType: 'application/pdf',
      });

      await expect(resume.save()).rejects.toThrow('No se permite la actualización de un currículum existente.');
      expect(mockResumeCreate).not.toHaveBeenCalled();
    });
  });
});
