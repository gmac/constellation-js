import Point from './point';
export default class Node extends Point {
    id: string;
    to: Record<string, boolean>;
    constructor(id: string, x?: number, y?: number, data?: Record<any, any>, to?: Record<string, boolean>);
    toPoint(): Point;
}
