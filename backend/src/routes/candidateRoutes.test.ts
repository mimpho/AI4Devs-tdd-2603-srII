import express from 'express';
import request from 'supertest';
import router from './candidateRoutes';
import { addCandidate } from '../presentation/controllers/candidateController';

jest.mock('../presentation/controllers/candidateController', () => ({
  addCandidate: jest.fn(),
}));

describe('POST /candidates', () => {
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
