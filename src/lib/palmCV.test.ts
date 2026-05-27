import { describe, it, expect } from 'vitest';
import { classifyLines, type NormalizedPoint } from './palmCV';

// Synthetic 500x500 image space so 1px ≈ 0.2% of width.
const W = 500;
const H = 500;

// Minimal landmarks (only the indices classifyLines reads: 0,1,9).
const landmarks: NormalizedPoint[] = Array.from({ length: 21 }, () => ({ x: 50, y: 50 }));
landmarks[0] = { x: 50, y: 90 };  // wrist
landmarks[1] = { x: 25, y: 70 };  // thumb base
landmarks[9] = { x: 50, y: 30 };  // middle finger base
// palmCenterX = 50, palmCenterY = 60, thumbX = 25

const seg = (x1: number, y1: number, x2: number, y2: number, depth = 0.7) => {
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { x1, y1, x2, y2, length, angle, depth };
};

describe('palmCV.classifyLines', () => {
  it('returns empty object when no segments', () => {
    expect(classifyLines({ segments: [], width: W, height: H }, landmarks)).toEqual({});
  });

  it('filters out short segments below the length threshold', () => {
    // length < 12% of diagonal (~85px)
    const result = classifyLines(
      { segments: [seg(100, 100, 110, 110)], width: W, height: H },
      landmarks
    );
    expect(Object.values(result).filter(Boolean)).toHaveLength(0);
  });

  it('classifies a long horizontal segment in the upper palm as the Heart line', () => {
    // Heart target y ≈ palmCenterY - 15 = 45 → place around y=45% (225px)
    const heart = seg(100, 225, 400, 225, 0.8);
    const result = classifyLines({ segments: [heart], width: W, height: H }, landmarks);
    expect(result.heartLine).toBeDefined();
    expect(result.heartLine!.confidence).toBeGreaterThan(0.3);
    expect(result.heartLine!.startX).toBeCloseTo(20, 0);
    expect(result.heartLine!.endX).toBeCloseTo(80, 0);
  });

  it('classifies a horizontal mid-palm segment as the Head line', () => {
    // palmCenterY = 60 → 300px
    const head = seg(100, 300, 400, 300, 0.7);
    const result = classifyLines({ segments: [head], width: W, height: H }, landmarks);
    expect(result.headLine).toBeDefined();
    expect(result.headLine!.confidence).toBeGreaterThan(0.3);
  });

  it('classifies a vertical center segment as the Fate line', () => {
    const fate = seg(250, 150, 250, 400, 0.75);
    const result = classifyLines({ segments: [fate], width: W, height: H }, landmarks);
    expect(result.fateLine).toBeDefined();
  });

  it('picks the best-scoring candidate when multiple segments compete', () => {
    const goodHeart = seg(100, 225, 400, 225, 0.9); // long, deep, on target
    const weakHeart = seg(150, 230, 250, 230, 0.3); // shorter, shallower
    const result = classifyLines(
      { segments: [weakHeart, goodHeart], width: W, height: H },
      landmarks
    );
    expect(result.heartLine).toBeDefined();
    // Best one spans 100..400 → 20..80 in normalized coords
    expect(result.heartLine!.endX - result.heartLine!.startX).toBeGreaterThan(40);
  });

  it('still produces output when landmarks are missing (uses defaults)', () => {
    const heart = seg(100, 175, 400, 175, 0.8); // y=35 ≈ default palmCenterY(50)-15
    const result = classifyLines({ segments: [heart], width: W, height: H }, null);
    expect(result.heartLine).toBeDefined();
  });
});

describe('palmCV exports', () => {
  it('exposes extractPalmLines and analyzePalmCV as functions', async () => {
    const mod = await import('./palmCV');
    expect(typeof mod.extractPalmLines).toBe('function');
    expect(typeof mod.analyzePalmCV).toBe('function');
    expect(typeof mod.loadOpenCV).toBe('function');
  });
});
