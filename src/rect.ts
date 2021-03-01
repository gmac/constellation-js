import Point from './point';

export default class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number=0, y: number=0, w: number=0, h: number=0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  hitTest(p: Point): boolean {
    const minX = Math.min(this.x, this.x + this.width);
    const maxX = Math.max(this.x, this.x + this.width);
    const minY = Math.min(this.y, this.y + this.height);
    const maxY = Math.max(this.y, this.y + this.height);

    return p.x >= minX && p.y >= minY && p.x <= maxX && p.y <= maxY;
  }
}
