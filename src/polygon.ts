import Point from './point';

export default class Polygon {
  public id: string;
  public points: Array<Point>;
  public data?: Record<any, any>;

  constructor(id: string, points: Array<Point>, data?: Record<any, any>) {
    this.id = id;
    this.points = points.slice();
    this.data = data;
  }
}
