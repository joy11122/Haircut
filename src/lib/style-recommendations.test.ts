import { describe, expect, it } from 'vitest';
import { getStyleRecommendations, type StylePreferences } from './style-recommendations';

const base: StylePreferences = {
  hairTexture: 'Wavy',
  hairLength: 'Short',
  maintenance: 'Low',
  vibe: 'Modern',
  beard: 'Recommend for me',
};

describe('getStyleRecommendations', () => {
  it('returns three personalized hair options and a beard option', () => {
    const result = getStyleRecommendations('Oval', base);
    expect(result.hair).toHaveLength(3);
    expect(result.beard.name).toBeTruthy();
    expect(result.hair[0].name).toBeTruthy();
  });

  it('prioritizes texture and selected preferences', () => {
    const result = getStyleRecommendations('Round', { ...base, hairTexture: 'Coily', hairLength: 'Medium', vibe: 'Natural' });
    expect(result.hair[0].textures).toContain('Coily');
    expect(result.hair[0].vibes).toContain('Natural');
  });

  it('adapts beard suggestions to explicit clean-shaven preference', () => {
    const result = getStyleRecommendations('Square', { ...base, beard: 'Clean shaven' });
    expect(result.beard.name).toBe('Clean, defined shave');
  });

  it('supports every face shape without empty recommendations', () => {
    for (const shape of ['Oval','Round','Square','Heart','Oblong','Diamond'] as const) {
      const result = getStyleRecommendations(shape, base);
      expect(result.hair).toHaveLength(3);
      expect(result.beard.name.length).toBeGreaterThan(0);
    }
  });

  it('keeps barber instructions available for every result', () => {
    const result = getStyleRecommendations('Heart', base);
    expect(result.hair.every(item => item.barberNote.length > 15)).toBe(true);
    expect(result.beard.barberNote.length).toBeGreaterThan(15);
  });
});
