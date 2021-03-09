import { ExtendedGrid } from '../src/extendedGrid';
import { Grid } from '../src/grid';
import { Point } from '../src/point';

describe('ExtendedGrid', () => {
  let grid: Grid;
  let exgrid: ExtendedGrid;

  beforeEach(() => {
    grid = new Grid();
    exgrid = new ExtendedGrid(grid);
    const a = grid.addNode(25, 25).id;
    const b = grid.addNode(75, 25).id;
    const c = grid.addNode(25, 75).id;
    const d = grid.addNode(75, 75).id;
    const e = grid.addNode(125, 25).id;

    grid.addCell([a, b, c]);
    grid.addCell([b, c, d]);
    grid.joinNodes([b, d, e]);
  });

  // function numConnections(id) {
  //   return Object.keys(grid.getNode(id).to).length;
  // }

  it('should directly conntect two points within a common polygon.', () => {
    const s = new Point(26, 26);
    const g = new Point(28, 28);
    expect(exgrid.route(s, g)).toEqual([s, g]);
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

  it('should snap a point to a grid segment, then directly connect it to a point within a related cell.', () => {
    const s = new Point(20, 50);
    const g = new Point(26, 26);
    expect(exgrid.route(s, g)).toEqual([s, new Point(25, 50), g]);
  });

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
