export default class Cell {
  public id: string;
  public rels: Array<string>;
  public data?: Record<any, any>;

  constructor(id: string, rels: Array<string>, data?: Record<any, any>) {
    this.id = id;
    this.rels = rels.slice();
    this.data = data;
    if (rels.length < 3) {
      throw new Error('A cell requires a minimum of three node references');
    }
  }

  toConfig() {
    return {
      id: this.id,
      rels: this.rels,
      data: this.data,
    };
  }
}
