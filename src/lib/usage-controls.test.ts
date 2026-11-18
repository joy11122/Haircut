import { describe, expect, it } from 'vitest';
import { parseRateLimitResult, utcDayKey } from './usage-controls';

describe('utcDayKey', () => {
  it('uses the UTC calendar date, not the machine local timezone', () => {
    expect(utcDayKey(new Date('2026-11-18T23:30:00.000Z'))).toBe('2026-11-18');
  });

  it('moves to the next UTC day at midnight', () => {
    expect(utcDayKey(new Date('2026-11-19T00:00:00.000Z'))).toBe('2026-11-19');
  });
});

describe('parseRateLimitResult', () => {
  it('parses a valid Redis Lua response', () => {
    expect(parseRateLimitResult([4, 532])).toEqual({ count: 4, resetInSeconds: 532 });
  });

  it('rejects missing or malformed results', () => {
    expect(parseRateLimitResult(null)).toBeNull();
    expect(parseRateLimitResult([1])).toBeNull();
    expect(parseRateLimitResult(['bad', 20])).toBeNull();
    expect(parseRateLimitResult([2, -1])).toBeNull();
  });
});
