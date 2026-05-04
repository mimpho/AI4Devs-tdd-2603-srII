const mockResumeCreate = jest.fn();

jest.mock('@prisma/client', () => {
  class PrismaClient {
    resume = {
      create: mockResumeCreate,
    };
  }

  return {
    PrismaClient,
  };
});

import { Resume } from './Resume';

describe('Resume.save', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a new resume when id is not provided', async () => {
    const now = new Date();
    const created = { id: 1, candidateId: 5, filePath: 'uploads/cv.pdf', fileType: 'application/pdf', uploadDate: now };
    mockResumeCreate.mockResolvedValue(created);

    const resume = new Resume({
      candidateId: 5,
      filePath: 'uploads/cv.pdf',
      fileType: 'application/pdf',
    });

    const result = await resume.save();

    expect(mockResumeCreate).toHaveBeenCalledWith({
      data: {
        candidateId: 5,
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        uploadDate: expect.any(Date),
      },
    });
    expect(result.filePath).toEqual('uploads/cv.pdf');
    expect(result.candidateId).toEqual(5);
  });

  it('throws error when trying to update an existing resume', async () => {
    const resume = new Resume({
      id: 1,
      candidateId: 5,
      filePath: 'uploads/cv_old.pdf',
      fileType: 'application/pdf',
    });

    await expect(resume.save()).rejects.toThrow(
      'No se permite la actualización de un currículum existente.'
    );
    expect(mockResumeCreate).not.toHaveBeenCalled();
  });
});
