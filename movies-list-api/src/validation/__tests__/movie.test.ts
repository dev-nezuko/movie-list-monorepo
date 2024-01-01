import { detectPosterType, parseTitle, parseYear } from '../movie';

describe('parseTitle', () => {
  test('trims surrounding whitespace', () => expect(parseTitle('  The Lantern Keeper ')).toBe('The Lantern Keeper'));
  test('rejects blanks, non-strings and over-long titles', () => {
    expect(parseTitle('   ')).toBeNull();
    expect(parseTitle(['a'])).toBeNull();
    expect(parseTitle('x'.repeat(201))).toBeNull();
    expect(parseTitle('x'.repeat(200))).toHaveLength(200);
  });
});

describe('parseYear', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  test('accepts four-digit years from 1888 to five years ahead', () => {
    expect(parseYear('1888', now)).toBe(1888);
    expect(parseYear('2031', now)).toBe(2031);
  });
  test('rejects fractions, padding tricks and out-of-range years', () => {
    for (const value of ['1887', '2032', '2020.5', '2e3', '', '0x7e4', 2020]) expect(parseYear(value, now)).toBeNull();
  });
});

describe('detectPosterType', () => {
  test('recognises PNG and JPEG signatures', () => {
    expect(detectPosterType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('image/png');
    expect(detectPosterType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
  });
  test('rejects SVG, GIF and truncated files', () => {
    expect(detectPosterType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(detectPosterType(Buffer.from('GIF89a'))).toBeNull();
    expect(detectPosterType(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});
