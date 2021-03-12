import { Point } from '../src/point';
import { Rect } from '../src/rect';
import {
  cross,
  ccw,
  intersect,
  angleDegrees,
  boundingRectForPoints,
  hitTestPointRing,
} from '../src/utils';

describe('cross', () => {
  // A - -
  // - - -
  // B - C
  const a: Point = new Point(0, 0);
  const b: Point = new Point(0, 2);
  const c: Point = new Point(2, 2);

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
  // B - C
  // - - -
  // A - -
  const a: Point = new Point(0, 0);
  const b: Point = new Point(0, 2);
  const c: Point = new Point(2, 2);

  it('returns true for counter-clockwise winding', () => {
    expect(ccw(a, c, b)).toEqual(true);
  });

  it('returns false for clockwise winding', () => {
    expect(ccw(a, b, c)).toEqual(false);
  });

  it('returns zero for straight alignment', () => {
    expect(ccw(a, b, a)).toEqual(false);
  });
});

describe('intersect', () => {
  // A - - D
  // - E - -
  // - - - -
  // B - - C
  const a: Point = new Point(0, 0);
  const b: Point = new Point(0, 3);
  const c: Point = new Point(3, 3);
  const d: Point = new Point(3, 0);
  const e: Point = new Point(1, 1);

  it('returns true for intersecting lines', () => {
    expect(intersect(a, c, b, d)).toEqual(true);
    expect(intersect(c, a, b, d)).toEqual(true);
    expect(intersect(c, a, d, b)).toEqual(true);
  });

  it('returns false for parallel lines', () => {
    expect(intersect(a, b, c, d)).toEqual(false);
    expect(intersect(b, a, c, d)).toEqual(false);
    expect(intersect(b, a, d, c)).toEqual(false);
    expect(intersect(a, d, b, c)).toEqual(false);
    expect(intersect(a, e, b, d)).toEqual(false);
  });
});

describe('angleDegrees', () => {
  it('returns degrees from positive x-origin', () => {
    expect(angleDegrees(new Point(5, 5), new Point(10, 10))).toEqual(45);
    expect(angleDegrees(new Point(-5, 5), new Point(-10, 10))).toEqual(135);
    expect(angleDegrees(new Point(-5, -5), new Point(-10, -10))).toEqual(225);
    expect(angleDegrees(new Point(5, -5), new Point(10, -10))).toEqual(315);
  });
});

describe('boundingRectForPoints', () => {
  // - - D -
  // A - - -
  // - - - C
  // - B - -
  const a: Point = new Point(0, 1);
  const b: Point = new Point(1, 3);
  const c: Point = new Point(3, 2);
  const d: Point = new Point(2, 0);

  it('returns the bounding box of a collection of points', () => {
    expect(boundingRectForPoints([a, b, c, d])).toEqual(new Rect(0, 0, 3, 3));
  });

  it('works with a single point', () => {
    expect(boundingRectForPoints([a])).toEqual(new Rect(0, 1, 0, 0));
  });

  it('returns zero origin for no points given', () => {
    expect(boundingRectForPoints([])).toEqual(new Rect(0, 0, 0, 0));
  });
});

describe('hitTestPointRing', () => {
  // - - D -
  // A - - -
  // - - - C
  // - B - -
  const a: Point = new Point(0, 1);
  const b: Point = new Point(1, 3);
  const c: Point = new Point(3, 2);
  const d: Point = new Point(2, 0);

  it('tests point in counter-clockwise winding', () => {
    expect(hitTestPointRing(new Point(1, 2), [a, b, c, d])).toEqual(true);
    expect(hitTestPointRing(new Point(0, 0), [a, b, c, d])).toEqual(false);
  });

  it('tests point in clockwise winding', () => {
    expect(hitTestPointRing(new Point(1, 2), [d, c, b, a])).toEqual(true);
    expect(hitTestPointRing(new Point(0, 0), [d, c, b, a])).toEqual(false);
  });
});
