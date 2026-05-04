const mockCandidateCreate = jest.fn();
const mockCandidateUpdate = jest.fn();
const mockCandidateFindUnique = jest.fn();

let PrismaClientInitializationErrorClass: any;

jest.mock('@prisma/client', () => {
  class PrismaClient {
    candidate = {
      create: mockCandidateCreate,
      update: mockCandidateUpdate,
      findUnique: mockCandidateFindUnique,
    };
  }

  class PrismaClientInitializationError extends Error {
    constructor(message: string, version: string) {
      super(message);
      this.name = 'PrismaClientInitializationError';
    }
  }

  // Store a reference to the class for use in tests
  PrismaClientInitializationErrorClass = PrismaClientInitializationError;

  return {
    PrismaClient,
    Prisma: {
      PrismaClientInitializationError,
    },
  };
});

import { Candidate } from './Candidate';

describe('Candidate.save', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses prisma.candidate.create with mapped nested payload for a new candidate', async () => {
    const payload = {
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      education: [
        {
          institution: 'UC3M',
          title: 'Computer Science',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2024-01-01'),
        },
      ],
      workExperience: [
        {
          company: 'Acme',
          position: 'Developer',
          description: 'Backend dev',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-01-01'),
        },
      ],
      resumes: [
        {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      ],
    };

    const created = { id: 1, firstName: 'Ana' };
    mockCandidateCreate.mockResolvedValue(created);

    const candidate = new Candidate(payload);
    const result = await candidate.save();

    expect(mockCandidateCreate).toHaveBeenCalledWith({
      data: {
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@example.com',
        educations: {
          create: [
            {
              institution: 'UC3M',
              title: 'Computer Science',
              startDate: new Date('2020-01-01'),
              endDate: new Date('2024-01-01'),
            },
          ],
        },
        workExperiences: {
          create: [
            {
              company: 'Acme',
              position: 'Developer',
              description: 'Backend dev',
              startDate: new Date('2024-02-01'),
              endDate: new Date('2025-01-01'),
            },
          ],
        },
        resumes: {
          create: [
            {
              filePath: 'uploads/cv.pdf',
              fileType: 'application/pdf',
            },
          ],
        },
      },
    });

    expect(result).toEqual(created);
  });

  it('uses prisma.candidate.update with where.id when candidate has an id', async () => {
    const updated = { id: 99, firstName: 'Updated' };
    mockCandidateUpdate.mockResolvedValue(updated);

    const candidate = new Candidate({
      id: 99,
      firstName: 'Updated',
      lastName: 'Lopez',
      email: 'updated@example.com',
      phone: '612345678',
    });

    const result = await candidate.save();

    expect(mockCandidateUpdate).toHaveBeenCalledWith({
      where: { id: 99 },
      data: {
        firstName: 'Updated',
        lastName: 'Lopez',
        email: 'updated@example.com',
        phone: '612345678',
      },
    });
    expect(result).toEqual(updated);
  });

  it('throws functional message when update fails with P2025 (record not found)', async () => {
    const error = new Error('An operation failed because it depends on one or more records that were required but not found.');
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

  it('throws functional message when update fails with PrismaClientInitializationError', async () => {
    const error = new PrismaClientInitializationErrorClass('Connection failed', '0.0.1');
    mockCandidateUpdate.mockRejectedValue(error);

    const candidate = new Candidate({
      id: 99,
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
    });

    await expect(candidate.save()).rejects.toThrow(
      'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
    );
  });

  it('throws functional message when create fails with PrismaClientInitializationError', async () => {
    const error = new PrismaClientInitializationErrorClass('Connection failed', '0.0.1');
    mockCandidateCreate.mockRejectedValue(error);

    const candidate = new Candidate({
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
    });

    await expect(candidate.save()).rejects.toThrow(
      'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
    );
  });
});
