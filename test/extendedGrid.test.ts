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

  // function numConnections(id) {
  //   return Object.keys(grid.getNode(id).to).length;
  // }

  it('should directly conntect two points within a common cell', () => {
    const s = new Point(1, 9);
    const g = new Point(5, 9);
    expect(exgrid.route(s, g)).toEqual([s, g]);
  });

  it('snaps a start point to the grid, then routes to nearest confined end point', () => {
    const s = new Point(-1, 5);
    const g = new Point(11, 9);
    expect(equalPoints(exgrid.route(s, g), [s, new Point(0, 5), c, new Point(10, 9)])).toEqual(true);
  });

  it('snaps a start point to the grid, then routes to an unconfined end point', () => {
    const s = new Point(-1, 5);
    const g = new Point(11, 9);
    expect(equalPoints(exgrid.route(s, g, false), [s, new Point(0, 5), c, new Point(10, 9), g])).toEqual(true);
  });

  // it('should directly connect two points in adjacent polygons who\'s ray intersects their common side.', () => {
  //   // Connect two points within the same polygon:
  //   const start = { x: 26, y: 26 };
  //   const goal = { x: 74, y: 74 };
  //   const path = grid.bridgePoints(start, goal);

  //   // Expect direct connection (start >> goal).
  //   expect(path.length).toEqual(2);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual(goal);
  // });

  // it('should snap a point to a grid segment, then directly connect it to a point within a related cell.')

  // it('should snap points to a grid segment, then directly connect them through a common polygon.', () => {
  //   const start = { x: 20, y: 50 };
  //   const goal = { x: 50, y: 20 };
  //   const path = grid.bridgePoints(start, goal);

  //   expect(path.length).toEqual(4);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual({ x: 25, y: 50 });
  //   expect(path[2]).toEqual({ x: 50, y: 25 });
  //   expect(path[3]).toEqual(goal);
  // });

  // it('should snap points to a grid segment, then directly connect them along a common line segment.', () => {
  //   const start = { x: 100, y: 20 };
  //   const goal = { x: 110, y: 20 };
  //   const path = grid.bridgePoints(start, goal);

  //   expect(path.length).toEqual(4);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual({ x: 100, y: 25 });
  //   expect(path[2]).toEqual({ x: 110, y: 25 });
  //   expect(path[3]).toEqual(goal);
  // });

  // it.only('should connect two points by following only the grid when no polygons are available.', () => {
  //   const start = { x: 120, y: 20 };
  //   const goal = { x: 120, y: 50 };
  //   const path = grid.bridgePoints(start, goal);

  //   expect(path.length).toEqual(5);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual({ x: 120, y: 25 });
  //   expect(path[2]).toEqual({ x: 125, y: 25 });
  //   // expect(path[3]).toEqual(some other point along the segment...);
  //   expect(path[4]).toEqual(goal);
  // });

  // it.only('should connect two points by following the grid using polygons, when available.', () => {
  //   const start = { x: 20, y: 70 };
  //   const goal = { x: 100, y: 20 };
  //   const path = grid.bridgePoints(start, goal);

  //   expect(path.length).toEqual(5);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual({ x: 25, y: 70 });
  //   expect(path[2]).toEqual({ x: 75, y: 25 });
  //   expect(path[3]).toEqual({ x: 100, y: 25 });
  //   expect(path[4]).toEqual(goal);
  // });

  // it('should exclude start point when already at a valid grid location.', () => {
  //   const start = { x: 25, y: 50 };
  //   const goal = { x: 26, y: 26 };
  //   const path = grid.bridgePoints(start, goal);

  //   expect(path.length).toEqual(2);
  //   expect(path[0]).toEqual({ x: 25, y: 50 });
  //   expect(path[1]).toEqual({ x: 26, y: 26 });
  // });

  // it('should exclude out-of-grid goal node when confined to the grid.', () => {
  //   const start = { x: 100, y: 20 };
  //   const goal = { x: 110, y: 20 };
  //   const path = grid.bridgePoints(start, goal, true);

  //   expect(path.length).toEqual(3);
  //   expect(path[0]).toEqual(start);
  //   expect(path[1]).toEqual({ x: 100, y: 25 });
  //   expect(path[2]).toEqual({ x: 110, y: 25 });
  // });

  // it.skip('bridgePoints: should connect two points via the grid using snapped-point bridge.', () => {
  //   var a = grid.addNode(0, 0).id;
  //   var b = grid.addNode(100, 100).id;
  //   var c = grid.addNode(200, 100).id;
  //   var d = grid.addNode(300, 0).id;
  //   grid.joinNodes(a, b);
  //   grid.joinNodes(b, c);
  //   grid.joinNodes(c, d);

  //   const path = grid.bridgePoints({ x: 50, y: 40 }, { x: 240, y: 40 });

  //   // Test that we got a path back:
  //   expect(path.length).toEqual(6);

  //   // Test that the grid has been cleaned up:
  //   expect(grid.getNumNodes()).toEqual(4);
  // });

  // it('bridgePoints: should eliminate redundant points in returned path.');
});
