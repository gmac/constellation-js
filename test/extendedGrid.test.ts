import { ExtendedGrid } from '../src/extendedGrid';
import { Grid } from '../src/grid';
import { Node } from '../src/gridNode';
import { Point } from '../src/point';

describe('ExtendedGrid', () => {
  let grid: Grid;
  let exgrid: ExtendedGrid;
  let a: Node, b: Node, c: Node, d: Node, e: Node;

  beforeEach(() => {
    grid = new Grid();
    exgrid = new ExtendedGrid(grid);

    // A -- D -- E
    // |x\  |
    // |xx\ |
    // B -- C
    a = grid.addNode(0, 0);
    b = grid.addNode(0, 10);
    c = grid.addNode(10, 10);
    d = grid.addNode(10, 0);
    e = grid.addNode(20, 0);

    grid.addCell([a, b, c].map(n => n.id));
    grid.joinNodes([a, c, d].map(n => n.id));
    grid.joinNodes([d, e].map(n => n.id));

    expect.extend({
      toEqualPoints(received: Array<Point | Node>, expected: Array<Point | Node>) {
        return {
          message: () => 'points tested',
          pass: received.every((p, i) => expected[i] && p.x === expected[i].x && p.y === expected[i].y),
        };
      }
    });
  });

  function equalPoints(received: Array<Point | Node>, expected: Array<Point | Node>): boolean {
    return received.every((p, i) => expected[i] && p.x === expected[i].x && p.y === expected[i].y);
  }

  it('should directly conntect two points within a common cell', () => {
    const s = new Point(1, 9);
    const g = new Point(5, 9);
    expect(exgrid.route(s, g)).toEqual([s, g]);
  });

  it('snaps a start point to the grid, then routes to nearest confined end point', () => {
    const s = new Point(-1, 5);
    const g = new Point(11, 9);
    const route = [s, new Point(0, 5), c, new Point(10, 9)];
    expect(equalPoints(exgrid.route(s, g), route)).toEqual(true);
  });

  it('snaps a start point to the grid, then routes to an unconfined end point', () => {
    const s = new Point(-1, 5);
    const g = new Point(11, 9);
    const route = [s, new Point(0, 5), c, new Point(10, 9), g];
    expect(equalPoints(exgrid.route(s, g, false), route)).toEqual(true);
  });

  it('snaps a start point to the grid, then directly routes to a point in a related cell', () => {
    const s = new Point(-1, 5);
    const g = new Point(1, 5);
    const route = [s, new Point(0, 5), g];
    expect(equalPoints(exgrid.route(s, g), route)).toEqual(true);
  });

  it('snaps start and end points to the grid, then directly routes points on the same segment', () => {
    const s = new Point(2, -1);
    const g = new Point(8, -1);
    const route = [s, new Point(2, 0), new Point(8, 0), g];
    expect(equalPoints(exgrid.route(s, g), route)).toEqual(true);
  });
});
