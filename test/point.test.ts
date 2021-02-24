import Point from '../src/point';

describe('Point', () => {
  it('builds a point with data', () => {
    const pt = new Point(1, 2, { key: 'val' });
    expect(pt.x).toEqual(1);
    expect(pt.y).toEqual(2);
    expect(pt.data).toEqual({ key: 'val' });
  });

  it('measures the distance between two points', () => {
    const a = new Point(0, 0);
    const b = new Point(0, 1);
    expect(Point.distance(a, b)).toEqual(1);
    expect(Point.distance(b, a)).toEqual(1);
  });
});
