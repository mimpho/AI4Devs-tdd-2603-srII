const mockEducationCreate = jest.fn();
const mockEducationUpdate = jest.fn();

jest.mock('@prisma/client', () => {
  class PrismaClient {
    education = {
      create: mockEducationCreate,
      update: mockEducationUpdate,
    };
  }

  return {
    PrismaClient,
  };
});

import { Education } from './Education';

describe('Education.save', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses prisma.education.create with correct data for a new education', async () => {
    const created = { id: 1, institution: 'UC3M', title: 'CS', startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01'), candidateId: null };
    mockEducationCreate.mockResolvedValue(created);

    const education = new Education({
      institution: 'UC3M',
      title: 'Computer Science',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2024-01-01'),
    });

    const result = await education.save();

    expect(mockEducationCreate).toHaveBeenCalledWith({
      data: {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
      },
    });
    expect(result).toEqual(created);
  });

  it('includes candidateId in create data when provided', async () => {
    const created = { id: 2, institution: 'UPM', title: 'EE', startDate: new Date('2021-01-01'), endDate: new Date('2025-01-01'), candidateId: 10 };
    mockEducationCreate.mockResolvedValue(created);

    const education = new Education({
      institution: 'UPM',
      title: 'Electrical Engineering',
      startDate: new Date('2021-01-01'),
      endDate: new Date('2025-01-01'),
      candidateId: 10,
    });

    const result = await education.save();

    expect(mockEducationCreate).toHaveBeenCalledWith({
      data: {
        institution: 'UPM',
        title: 'Electrical Engineering',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2025-01-01'),
        candidateId: 10,
      },
    });
    expect(result).toEqual(created);
  });

  it('uses prisma.education.update with where.id when education has an id', async () => {
    const updated = { id: 5, institution: 'Updated', title: 'Updated Title', startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01'), candidateId: 10 };
    mockEducationUpdate.mockResolvedValue(updated);

    const education = new Education({
      id: 5,
      institution: 'Updated',
      title: 'Updated Title',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2024-01-01'),
      candidateId: 10,
    });

    const result = await education.save();

    expect(mockEducationUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        institution: 'Updated',
        title: 'Updated Title',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        candidateId: 10,
      },
    });
    expect(result).toEqual(updated);
  });
});
