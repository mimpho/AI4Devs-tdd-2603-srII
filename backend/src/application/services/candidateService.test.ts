import { addCandidate } from './candidateService';
import { validateCandidateData } from '../validator';

const mockCandidateSave = jest.fn();
const mockEducationSave = jest.fn();
const mockWorkExperienceSave = jest.fn();
const mockResumeSave = jest.fn();

const createdEducationModels: any[] = [];
const createdWorkExperienceModels: any[] = [];
const createdResumeModels: any[] = [];

jest.mock('../../domain/models/Candidate', () => ({
  Candidate: jest.fn().mockImplementation(() => ({
    save: mockCandidateSave,
    education: [],
    workExperience: [],
    resumes: [],
  })),
}));

jest.mock('../../domain/models/Education', () => ({
  Education: jest.fn().mockImplementation((data: any) => {
    const model = {
      ...data,
      candidateId: undefined,
      save: mockEducationSave,
    };
    createdEducationModels.push(model);
    return model;
  }),
}));

jest.mock('../../domain/models/WorkExperience', () => ({
  WorkExperience: jest.fn().mockImplementation((data: any) => {
    const model = {
      ...data,
      candidateId: undefined,
      save: mockWorkExperienceSave,
    };
    createdWorkExperienceModels.push(model);
    return model;
  }),
}));

jest.mock('../../domain/models/Resume', () => ({
  Resume: jest.fn().mockImplementation((data: any) => {
    const model = {
      ...data,
      candidateId: undefined,
      save: mockResumeSave,
    };
    createdResumeModels.push(model);
    return model;
  }),
}));

jest.mock('../validator', () => ({
  validateCandidateData: jest.fn(),
}));

describe('addCandidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createdEducationModels.length = 0;
    createdWorkExperienceModels.length = 0;
    createdResumeModels.length = 0;
  });

  it('validates candidate data before any persistence', async () => {
    const candidateData = {
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
    };

    (validateCandidateData as jest.Mock).mockImplementation(() => {
      throw new Error('Validation failed');
    });

    await expect(addCandidate(candidateData)).rejects.toThrow('Validation failed');
    expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
  });

  it('maps prisma P2002 to a functional duplicate-email message', async () => {
    const candidateData = {
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
    };

    (validateCandidateData as jest.Mock).mockImplementation(() => undefined);
    mockCandidateSave.mockRejectedValue({ code: 'P2002' });

    await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
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

    const savedCandidate = { id: 123 };

    (validateCandidateData as jest.Mock).mockImplementation(() => undefined);
    mockCandidateSave.mockResolvedValue(savedCandidate);
    mockEducationSave.mockResolvedValue({});
    mockWorkExperienceSave.mockResolvedValue({});
    mockResumeSave.mockResolvedValue({});

    await expect(addCandidate(candidateData)).resolves.toEqual(savedCandidate);

    expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
    expect(mockCandidateSave).toHaveBeenCalledTimes(1);
    expect(mockEducationSave).toHaveBeenCalledTimes(1);
    expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
    expect(mockResumeSave).toHaveBeenCalledTimes(1);

    expect(createdEducationModels[0].candidateId).toBe(123);
    expect(createdWorkExperienceModels[0].candidateId).toBe(123);
    expect(createdResumeModels[0].candidateId).toBe(123);

    expect(mockCandidateSave.mock.invocationCallOrder[0]).toBeLessThan(mockEducationSave.mock.invocationCallOrder[0]);
    expect(mockCandidateSave.mock.invocationCallOrder[0]).toBeLessThan(mockWorkExperienceSave.mock.invocationCallOrder[0]);
    expect(mockCandidateSave.mock.invocationCallOrder[0]).toBeLessThan(mockResumeSave.mock.invocationCallOrder[0]);
  });
});
