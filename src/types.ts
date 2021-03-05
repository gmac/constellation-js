import { Node } from './gridNode';
import { Path } from './gridPath';

export interface GridData {
  nodes: Array<{ id: string, x: number, y: number, to: Array<string>, data?: Record<any, any> }>,
  cells: Array<{ id: string, rels: Array<string>, data?: Record<any, any> }>,
}

export type NodeCostComparator = (a: Node, b: Node) => number;

export type PathSelector = (a: Path, b: Path) => Path;
