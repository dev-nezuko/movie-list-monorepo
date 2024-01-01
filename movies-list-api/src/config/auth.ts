export function jwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32 || /^(replace|your-secret-key)/i.test(value)) {
    throw new Error('Configure a unique JWT_SECRET of at least 32 characters');
  }
  return value;
}
