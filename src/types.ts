import Node from './gridNode';
import Path from './gridPath';

export type NodeCostComparator = (a: Node, b: Node) => number;
export type PathSelector = (a: Path, b: Path) => Path;
