import request from 'supertest';
import app, { allowedOrigins, trustProxy } from '../app';

jest.mock('../models/user');
jest.mock('../models/movie');

test('malformed JSON gets a JSON 400 instead of an HTML stack page', async () => {
  const response = await request(app).post('/login').set('Content-Type', 'application/json').send('{"email":');
  expect(response.status).toBe(400);
  expect(response.body).toEqual({ message: 'Malformed JSON body' });
});

test('CORS answers only the configured origins', async () => {
  const allowed = await request(app).options('/movies').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'GET');
  const other = await request(app).options('/movies').set('Origin', 'https://elsewhere.example').set('Access-Control-Request-Method', 'GET');
  expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  expect(other.headers['access-control-allow-origin']).toBeUndefined();
});

test('CORS_ORIGIN accepts a comma-separated list', () => {
  expect(allowedOrigins(' http://a.example , http://b.example ,')).toEqual(['http://a.example', 'http://b.example']);
});

test('the framework banner header is not sent', async () => {
  const response = await request(app).post('/logout');
  expect(response.headers['x-powered-by']).toBeUndefined();
});

test('TRUST_PROXY accepts only a positive hop count', () => {
  expect(trustProxy('1')).toBe(1);
  for (const value of [undefined, '', '0', 'true', '-1', '1.5']) expect(trustProxy(value)).toBe(false);
});
