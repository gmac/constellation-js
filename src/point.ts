export class Point {

  // Find the distance between two points.
  public static distance(a: Point, b: Point): number {
    return Math.sqrt(Point.distance2(a, b));
  }

  // A cheaper version of distance squared, for heuristics
  public static distance2(a: Point, b: Point): number {
    const x: number = b.x-a.x;
    const y: number = b.y-a.y;
    return x * x + y * y;
  }

  public x: number;
  public y: number;
  public data?: Record<any, any>;

  constructor(x: number=0, y: number=0, data?: Record<any, any>) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
}
