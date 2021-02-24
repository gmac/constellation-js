import Point from './point';
export default class Polygon {
    id: string;
    points: Array<Point>;
    data?: Record<any, any>;
    constructor(id: string, points: Array<Point>, data?: Record<any, any>);
}
