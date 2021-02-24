export default class Point {
    static distance(a: Point, b: Point): number;
    x: number;
    y: number;
    data?: Record<any, any>;
    constructor(x?: number, y?: number, data?: Record<any, any>);
}
