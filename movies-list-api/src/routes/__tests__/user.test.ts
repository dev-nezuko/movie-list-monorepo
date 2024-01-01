import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import User from '../../models/user';

jest.mock('../../models/user');
jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const key = 'synthetic-unit-test-signing-value-only';
const original = process.env.JWT_SECRET;
beforeEach(() => { process.env.JWT_SECRET = key; jest.clearAllMocks(); });
afterAll(() => { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; });

test('login matches the email case-insensitively and stores the issued token', async () => {
  const save = jest.fn().mockResolvedValue(undefined);
  const user: Record<string, unknown> = { _id: '658ccc596886d1690c9e4cfb', email: 'demo@example.invalid', password: 'hash', save };
  (User.findOne as jest.Mock).mockResolvedValue(user);
  (bcrypt.compare as jest.Mock).mockResolvedValue(true);

  const response = await request(app).post('/login').send({ email: ' Demo@Example.INVALID ', password: 'synthetic-password' });

  expect(response.status).toBe(200);
  expect(User.findOne).toHaveBeenCalledWith({ email: 'demo@example.invalid' });
  expect(user.authToken).toBe(response.body.token);
  expect(save).toHaveBeenCalledTimes(1);
});

test('a wrong password and an unknown email get the same 401', async () => {
  (User.findOne as jest.Mock).mockResolvedValueOnce(null);
  const unknown = await request(app).post('/login').send({ email: 'nobody@example.invalid', password: 'x' });
  (User.findOne as jest.Mock).mockResolvedValueOnce({ password: 'hash' });
  (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
  const wrong = await request(app).post('/login').send({ email: 'demo@example.invalid', password: 'x' });
  expect(unknown.status).toBe(401);
  expect(wrong.status).toBe(401);
  expect(unknown.body).toEqual(wrong.body);
});

test('non-string credentials are refused before any lookup', async () => {
  const response = await request(app).post('/login').send({ email: { $ne: null }, password: 'x' });
  expect(response.status).toBe(400);
  expect(User.findOne).not.toHaveBeenCalled();
});
