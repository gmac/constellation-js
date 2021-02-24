import Node from './gridNode';
export default class Path {
    nodes: Array<Node>;
    weight: number;
    estimate: number;
    constructor(nodes?: Array<Node>, weight?: number, estimate?: number);
    copy(weight?: number, estimate?: number): Path;
}
