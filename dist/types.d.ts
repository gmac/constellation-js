import Node from './gridNode';
import Path from './gridPath';
export declare type NodeDifference = (a: Node, b: Node) => number;
export declare type PathSelector = (a: Path, b: Path) => Path;
