export class Point {

  // Tests the distance between two points.
  public static distance(a: Point, b: Point): number {
    const x: number = b.x-a.x;
    const y: number = b.y-a.y;
    return Math.sqrt(x*x + y*y);
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
