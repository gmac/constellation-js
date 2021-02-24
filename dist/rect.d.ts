import Point from './point';
export default class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x?: number, y?: number, w?: number, h?: number);
    hitTest(p: Point): boolean;
}
