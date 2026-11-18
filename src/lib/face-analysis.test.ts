import { describe, expect, it } from 'vitest';
import { classifyFaceLandmarks, type FaceLandmarkPoint } from './face-analysis';

function makeLandmarks(length: number, forehead: number, jaw: number): FaceLandmarkPoint[] {
  const points = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  points[10] = { x: 0.5, y: 0.1 };
  points[152] = { x: 0.5, y: 0.1 + length };
  points[234] = { x: 0.2, y: 0.5 };
  points[454] = { x: 0.8, y: 0.5 };
  points[127] = { x: 0.5 - forehead / 2, y: 0.3 };
  points[356] = { x: 0.5 + forehead / 2, y: 0.3 };
  points[172] = { x: 0.5 - jaw / 2, y: 0.75 };
  points[397] = { x: 0.5 + jaw / 2, y: 0.75 };
  return points;
}

describe('classifyFaceLandmarks', () => {
  it('recognizes an elongated face', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.91, 0.5, 0.48)).shape).toBe('Oblong');
  });

  it('recognizes a heart-shaped proportion', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.8, 0.72, 0.4)).shape).toBe('Heart');
  });

  it('recognizes a diamond-shaped proportion', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.8, 0.45, 0.4)).shape).toBe('Diamond');
  });

  it('recognizes a square-shaped proportion', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.8, 0.52, 0.52)).shape).toBe('Square');
  });

  it('recognizes a round-shaped proportion', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.72, 0.5, 0.48)).shape).toBe('Round');
  });

  it('falls back to oval for balanced proportions', () => {
    expect(classifyFaceLandmarks(makeLandmarks(0.8, 0.5, 0.4)).shape).toBe('Oval');
  });

  it('rejects incomplete landmark arrays', () => {
    expect(() => classifyFaceLandmarks([])).toThrow(/landmarks were incomplete/i);
  });

  it('rejects degenerate landmark measurements', () => {
    const points = makeLandmarks(0.8, 0.5, 0.4);
    points[234] = points[454];
    expect(() => classifyFaceLandmarks(points)).toThrow(/facial detail/i);
  });

  it('returns bounded, numeric confidence and rounded proportions', () => {
    const result = classifyFaceLandmarks(makeLandmarks(0.8, 0.5, 0.4));
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(Number.isFinite(result.proportions.lengthToWidth)).toBe(true);
  });
});
