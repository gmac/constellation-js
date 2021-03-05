import { Node } from './gridNode';

export class Path {
  public nodes: Array<Node>;
  public weight: number;
  public estimate: number;

  constructor(nodes: Array<Node>=[], weight: number=0, estimate: number=0) {
    this.nodes = nodes;
    this.weight = weight;
    this.estimate = estimate;
  }

  copy(weight?: number, estimate?: number) {
    return new Path(this.nodes.slice(), weight ?? this.weight, estimate ?? this.estimate);
  }
}
