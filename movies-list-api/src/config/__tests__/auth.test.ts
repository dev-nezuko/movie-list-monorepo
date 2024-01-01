import { jwtSecret } from '../auth';
const previous = process.env.JWT_SECRET;
afterEach(() => {if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET=previous;});
test('missing, short and documented placeholder keys are rejected', () => {
  for (const value of ['', 'short', 'replace-with-a-private-secret-of-at-least-32-characters']) {
    process.env.JWT_SECRET=value;expect(() => jwtSecret()).toThrow('Configure a unique');
  }
});
test('a separately configured long signing value is used', () => {
  process.env.JWT_SECRET='synthetic-unit-test-signing-value-only';expect(jwtSecret()).toBe(process.env.JWT_SECRET);
});
