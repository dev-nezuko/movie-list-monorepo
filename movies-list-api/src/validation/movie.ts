export const TITLE_MAX_LENGTH = 200;
// The first commercial film screenings were in 1888; anything earlier is a typo.
export const EARLIEST_YEAR = 1888;

export type PosterType = 'image/png' | 'image/jpeg';

export function parseTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const title = value.trim();
  return title && title.length <= TITLE_MAX_LENGTH ? title : null;
}

export function parseYear(value: unknown, now = new Date()): number | null {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value.trim())) return null;
  const year = Number(value);
  return year >= EARLIEST_YEAR && year <= now.getFullYear() + 5 ? year : null;
}

// Trust the file's leading bytes rather than the client-supplied Content-Type.
export function detectPosterType(buffer: Buffer): PosterType | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  return null;
}
