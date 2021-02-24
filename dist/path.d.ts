import Node from './node';
export default class Path {
    static prioratize(a: Path, b: Path): number;
    nodes: Array<Node>;
    weight: number;
    estimate: number;
    constructor(nodes?: Array<Node>, weight?: number, estimate?: number);
    copy(weight?: number, estimate?: number): Path;
    last(): Node;
    contains(node: any): boolean;
}
