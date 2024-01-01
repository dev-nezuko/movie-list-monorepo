import request from 'supertest';
import bcrypt from 'bcrypt';
import { ipKeyGenerator } from 'express-rate-limit';
import app from '../../app';
import User from '../../models/user';
import { loginLimiter } from '../user';

jest.mock('../../models/user');
jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const key = 'synthetic-unit-test-signing-value-only';
const original = process.env.JWT_SECRET;
beforeEach(async () => {
  process.env.JWT_SECRET = key;
  jest.clearAllMocks();
  // supertest connects over loopback; clear both address forms so each test starts with a fresh allowance.
  for (const address of ['::ffff:127.0.0.1', '127.0.0.1']) await loginLimiter.resetKey(ipKeyGenerator(address));
});
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

test('the eleventh failed sign-in from one address within 15 minutes gets 429', async () => {
  (User.findOne as jest.Mock).mockResolvedValue(null);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    expect((await request(app).post('/login').send({ email: 'nobody@example.invalid', password: 'x' })).status).toBe(401);
  }
  const blocked = await request(app).post('/login').send({ email: 'nobody@example.invalid', password: 'x' });
  expect(blocked.status).toBe(429);
  expect(blocked.body.message).toMatch(/Too many failed sign-in attempts/);
  expect(User.findOne).toHaveBeenCalledTimes(10);
});
