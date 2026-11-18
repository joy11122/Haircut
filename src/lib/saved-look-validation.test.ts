import { describe, expect, it } from 'vitest';
import { saveLookSchema } from './saved-look-validation';

describe('saved-look request validation', () => {
  it('accepts an allowlisted style and trusted provider output', () => {
    expect(saveLookSchema.safeParse({
      styleId: 'textured-crop',
      imageUrl: 'https://replicate.delivery/example/result.jpg',
    }).success).toBe(true);
  });

  it('rejects unsupported styles and arbitrary image hosts', () => {
    expect(saveLookSchema.safeParse({
      styleId: 'unknown-cut',
      imageUrl: 'https://replicate.delivery/example/result.jpg',
    }).success).toBe(false);
    expect(saveLookSchema.safeParse({
      styleId: 'textured-crop',
      imageUrl: 'https://attacker.example/image.jpg',
    }).success).toBe(false);
  });

  it('rejects non-HTTPS provider URLs', () => {
    expect(saveLookSchema.safeParse({
      styleId: 'textured-crop',
      imageUrl: 'http://replicate.delivery/example/result.jpg',
    }).success).toBe(false);
  });
});
