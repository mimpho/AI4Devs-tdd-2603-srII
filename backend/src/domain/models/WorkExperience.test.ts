const mockWorkExperienceCreate = jest.fn();
const mockWorkExperienceUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  class PrismaClient {
    workExperience = {
      create: mockWorkExperienceCreate,
      update: mockWorkExperienceUpdate,
    };
  }

  return {
    PrismaClient,
  };
});

import { WorkExperience } from './WorkExperience';

describe('WorkExperience.save', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses prisma.workExperience.create with correct data for a new work experience', async () => {
    const created = { id: 1, company: 'Acme', position: 'Developer', description: 'Backend', startDate: new Date('2024-01-01'), endDate: new Date('2025-01-01'), candidateId: null };
    mockWorkExperienceCreate.mockResolvedValue(created);

    const workExp = new WorkExperience({
      company: 'Acme',
      position: 'Developer',
      description: 'Backend',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
    });

    const result = await workExp.save();

    expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
      data: {
        company: 'Acme',
        position: 'Developer',
        description: 'Backend',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      },
    });
    expect(result).toEqual(created);
  });

  it('includes candidateId in create data when provided', async () => {
    const created = { id: 2, company: 'TechCorp', position: 'Senior Dev', description: 'Fullstack', startDate: new Date('2023-06-01'), endDate: new Date('2024-12-01'), candidateId: 15 };
    mockWorkExperienceCreate.mockResolvedValue(created);

    const workExp = new WorkExperience({
      company: 'TechCorp',
      position: 'Senior Dev',
      description: 'Fullstack',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-12-01'),
      candidateId: 15,
    });

    const result = await workExp.save();

    expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
      data: {
        company: 'TechCorp',
        position: 'Senior Dev',
        description: 'Fullstack',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-12-01'),
        candidateId: 15,
      },
    });
    expect(result).toEqual(created);
  });

  it('uses prisma.workExperience.update with where.id when workExperience has an id', async () => {
    const updated = { id: 10, company: 'UpdatedCorp', position: 'Lead Dev', description: 'Architecture', startDate: new Date('2023-01-01'), endDate: null, candidateId: 20 };
    mockWorkExperienceUpdate.mockResolvedValue(updated);

    const workExp = new WorkExperience({
      id: 10,
      company: 'UpdatedCorp',
      position: 'Lead Dev',
      description: 'Architecture',
      startDate: new Date('2023-01-01'),
      candidateId: 20,
    });

    const result = await workExp.save();

    expect(mockWorkExperienceUpdate).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        company: 'UpdatedCorp',
        position: 'Lead Dev',
        description: 'Architecture',
        startDate: new Date('2023-01-01'),
        endDate: undefined,
        candidateId: 20,
      },
    });
    expect(result).toEqual(updated);
  });
});
