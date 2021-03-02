import { Point } from './point';

export class Node extends Point {
  public id: string;
  public to: Record<string, boolean>;

  constructor(id: string, x: number=0, y: number=0, to: Array<string>=[], data?: Record<any, any>) {
    super(x, y, data);
    this.id = id;
    this.to = to.reduce((memo: Record<string, boolean>, id: string) => {
      memo[id] = true;
      return memo;
    }, Object.create(null));
  }

  toConfig() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      to: Object.keys(this.to),
      data: this.data,
    };
  }
}
