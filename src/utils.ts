import { Point } from './point';
import { Rect } from './rect';

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function compositeId(ids: Array<string>): string {
  return ids.slice().sort().join('/');
}

// Test if point Z is left|on|right of an infinite 2D line.
// > 0 left, = 0 on, < 0 right
export function cross(x: Point, y: Point, z: Point): number {
  return (y.x - x.x) * (z.y - x.y) - (z.x - x.x) * (y.y - x.y);
}

// Tests for counter-clockwise winding among three points.
// @param x: Point X of triangle XYZ.
// @param y: Point Y of triangle XYZ.
// @param z: Point Z of triangle XYZ.
// @param exclusive boolean: when true, equal points will be excluded from the test.
export function ccw(x: Point, y: Point, z: Point): boolean {
  return cross(x, y, z) < 0;
}

// Tests for intersection between line segments AB and CD.
// @param a: Point A of line AB.
// @param b: Point B of line AB.
// @param c: Point C of line CD.
// @param d: Point D of line CD.
// @return: true if AB intersects CD.
export function intersect(a: Point, b: Point, c: Point, d: Point): boolean {
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

// Convert degrees to radians.
// @param degrees value.
// @return radians equivalent.
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Convert radians to degrees.
// @param radians value.
// @return degrees equivalent.
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

// Calculates the angle (in radians) between line segment AB and the positive X-origin.
// @param a: Point A of line AB.
// @param b: Point B of line AB.
// @return angle (in radians).
export function angleRadians(a: Point, b: Point): number {
  return Math.atan2(b.y-a.y, b.x-a.x);
}

// Calculates the angle (in degrees) between line segment AB and the positive X-origin.
// Degree value is adjusted to fall within a 0-360 range.
// @param a: Point A of line AB.
// @param b: Point B of line AB.
// @return: angle degrees (0-360 range)
export function angleDegrees(a: Point, b: Point): number {
  const degrees = radiansToDegrees(angleRadians(a, b));
  return degrees < 0 ? degrees + 360 : degrees;
}

// Gets the index of the circle sector that an angle falls into.
// This is useful for applying view states to a graphic while moving it around the grid.
// Ex: create 8 walk cycles
// @param radians: angle radians to test.
// @param sectors: number of sectors to divide the circle into. Default is 8.
// @param offset: offsets the origin of the sector divides within the circle. Default is PI*2/16.
// @return sector index (a number between 0 and X-1, where X is number of sectors).
export function angleSector(radians: number, sectors: number, offset: number): number {
  const circ = Math.PI * 2;
  sectors = sectors || 8;
  offset = offset || circ / (sectors * 2);

  if (radians < 0) {
    radians = circ + radians;
  }

  radians += offset;

  if (radians > circ) {
    radians -= circ;
  }

  return Math.floor(radians / (circ / sectors));
}

// Gets the rectangular bounds of a point ring.
// @param points: The ring of points to measure bounding on.
// @return: a new Rect object of the ring's maximum extent.
export function boundingRectForPoints(points: Array<Point>): Rect {
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  points.forEach(pt => {
    minX = Math.min(minX, pt.x);
    maxX = Math.max(maxX, pt.x);
    minY = Math.min(minY, pt.y);
    maxY = Math.max(maxY, pt.y);
  });

  return new Rect(minX, minY, maxX-minX, maxY-minY);
}

// Tests if point P falls within a polygonal region; test performed by ray casting.
// @param p: The point to test.
// @param points: An array of points forming a polygonal shape.
// @return: true if point falls within point ring.
export function hitTestPointRing(p: Point, points: Array<Point>): boolean {
  let wn = 0; // winding number

  points.forEach((a, i) => {
    const b = points[(i+1) % points.length];
    if (a.y <= p.y) {
      if (b.y > p.y && cross(a, b, p) > 0) {
        wn += 1;
      }
    } else if (b.y <= p.y && cross(a, b, p) < 0) {
      wn -= 1;
    }
  });

  return wn !== 0;
}

// Snaps point P to the nearest position along line segment AB.
// @param p: Point P to snap to line segment AB.
// @param a: Point A of line segment AB.
// @param b: Point B of line segment AB.
// @return: new Point object with snapped coordinates.
export function snapPointToLineSegment(p: Point, a: Point, b: Point): Point {
  const ap1: number = p.x-a.x;
  const ap2: number = p.y-a.y;
  const ab1: number = b.x-a.x;
  const ab2: number = b.y-a.y;
  const mag: number = ab1*ab1 + ab2*ab2;
  const dot: number = ap1*ab1 + ap2*ab2;
  const t: number = dot/mag;

  if (t < 0) {
    return new Point(a.x, a.y);
  } else if (t > 1) {
    return new Point(b.x, b.y);
  }
  return new Point(a.x + ab1 * t, a.y + ab2 * t);
}

// Finds the nearest point within an array of points to target P.
// @param p: Point P to test against.
// @param points: Array of Points to find the nearest point within.
// @return: nearest Point to P, or null if no points were available.
export function nearestPointToPoint(p: Point, points: Array<Point>): Point | null {
  let bestPt: Point | null = null;
  let bestDist: number = Infinity;

  // Sort points by horizontal offset from P.
  points = points.slice().sort((a, b) => Math.abs(p.x-b.x) - Math.abs(p.x-a.x));

  for (let i = points.length-1; i >= 0; i -= 1) {
    const a = points[i];
    if (Math.abs(p.x-a.x) < bestDist) {
      const dist = Point.distance(p, a);
      if (dist < bestDist) {
        bestPt = a;
        bestDist = dist;
      }
    } else {
      break;
    }
  }

  return bestPt;
}
