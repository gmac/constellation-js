import Cell from './gridCell';
import Node from './gridNode';
import Path from './gridPath';
import { NodeDifference, PathSelector } from './types';
interface GridData {
    nodes: Array<{
        id: string;
        x: number;
        y: number;
        to: Array<string>;
        data?: Record<any, any>;
    }>;
    cells: Array<{
        id: string;
        rels: Array<string>;
        data?: Record<any, any>;
    }>;
}
export default class Grid {
    private nodes;
    private cells;
    constructor(data?: GridData);
    toConfig(): GridData;
    reset(data?: GridData): void;
    addNode(x: number, y: number, data?: Record<any, any>): Node;
    get nodeCount(): number;
    getNode(id: string): Node;
    getNodes(ids: Array<string>): Array<Node>;
    hasNodes(ids: Array<string>): boolean;
    joinNodes(ids: Array<string>): boolean;
    splitNodes(ids: Array<string>): boolean;
    detachNodes(ids: Array<string>): boolean;
    removeNodes(ids: Array<string>): boolean;
    addCell(rels: Array<string>, data?: Record<any, any>): Cell;
    getCell(id: string): Cell;
    getCells(ids: Array<string>): Array<Cell>;
    nodesForCell(id: string): Array<Node>;
    get cellCount(): number;
    removeCells(ids: Array<string>): boolean;
    findPath({ start, goal, weightFunction, estimateFunction, tiebreakerFunction, }: {
        start: string;
        goal: string;
        weightFunction?: NodeDifference;
        estimateFunction?: NodeDifference;
        tiebreakerFunction?: PathSelector;
    }): Path | null;
}
export {};
