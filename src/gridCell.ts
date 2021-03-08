import { compositeId } from './utils';

export class Cell {
  public id: string;
  public rels: Array<string>;
  public edges: Record<string, boolean>;
  public data?: Record<any, any>;

  constructor(id: string, rels: Array<string>, data?: Record<any, any>) {
    this.id = id;
    this.data = data;

    if (rels.length !== 3) {
      throw new Error('A cell requires exactly three node references');
    }

    this.rels = rels.slice();
    this.edges = rels.reduce((acc, a, i) => {
      const b = rels[(i+1) % rels.length];
      acc[compositeId([a, b])] = true;
      return acc;
    }, Object.create(null));
  }

  toConfig() {
    return {
      id: this.id,
      rels: this.rels,
      data: this.data,
    };
  }
}
