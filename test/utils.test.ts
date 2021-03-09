import { Point } from '../src/point';
import { cross, ccw } from '../src/utils';

describe('cross', () => {
  const a: Point = new Point(0, 0);
  const b: Point = new Point(0, 10);
  const c: Point = new Point(10, 10);

  it('returns negative for counter-clockwise winding', () => {
    expect(cross(a, b, c)).toBeLessThan(0);
    expect(cross(b, c, a)).toBeLessThan(0);
    expect(cross(c, a, b)).toBeLessThan(0);
  });

  it('returns positive for clockwise winding', () => {
    expect(cross(c, b, a)).toBeGreaterThan(0);
    expect(cross(b, a, c)).toBeGreaterThan(0);
    expect(cross(a, c, b)).toBeGreaterThan(0);
  });

  it('returns zero for straight alignment', () => {
    expect(cross(a, b, a)).toEqual(0);
  });
});

describe('ccw', () => {
  const a: Point = new Point(0, 0);
  const b: Point = new Point(0, 10);
  const c: Point = new Point(10, 10);

  it('returns true for counter-clockwise winding', () => {
    expect(ccw(a, b, c)).toEqual(true);
  });

  it('returns false for clockwise winding', () => {
    expect(ccw(a, c, b)).toEqual(false);
  });

  it('returns zero for straight alignment', () => {
    expect(ccw(a, b, a)).toEqual(false);
  });
});
