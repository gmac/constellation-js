import Point from './point';
export default class Node extends Point {
    id: string;
    to: Record<string, boolean>;
    constructor(id: string, x?: number, y?: number, to?: Array<string>, data?: Record<any, any>);
    toConfig(): {
        id: string;
        x: number;
        y: number;
        to: string[];
        data: Record<any, any> | undefined;
    };
}
