import { Grid } from './grid';
import { Cell } from './gridCell';
import { Point } from './point';

export class ExtendedGrid {
  constructor(grid) {
    this.grid = grid;
  }

  // Creates a path between two external (non-grid) points, using the grid to navigate between them.
  // Start and goal points will be integrated as best as possible into the grid, then route between.
  // @param a  Starting Point object to path from.
  // @param b  Goal Point object to bridge to.
  // @param confineToGrid  Specify TRUE to lock final route point to within the grid.
  // @return  an array of Point objects specifying a path to follow.
  route(a: Point, b: Point, confineToGrid: boolean = true): Array<Point> {

    // 1) Connect points through common polygon (todo: region).
    // 3) Snap points to grid, connect anchors to segment and related polys.
    // 4) Direct connect points on common line segment.
    // 5) Direct connect points in common polygon.

    // Connect points through a common polygon:
    // Get polygon intersections for each point.
    const acells = this.grid.cellsContainingPoint(a);
    const bcells = this.grid.cellsContainingPoint(b);

    // Test if points can be bridged through the polygon grid:
    // If so, a direction connection can be made.
    // @todo – needs a polygon union with edge intersections
    if (acells.find(cell => bcells.includes(cell))) {
      return [a, b];
    }

    // Connect temporary anchors to the node grid via polygons:
    const anchorA = createBridgeAnchor(this.grid, a, acells);
    const anchorB = createBridgeAnchor(this.grid, b, bcells);
  }
}

function createBridgeAnchor(grid: Grid, pt: Point, cells: Array<Cell>) {
  const anchor = grid.addNode(pt.x, pt.y, {});

  // Attach to grid if there are no polygons to hook into:
  // this may generate some new polygons for the point.
  if (!cells.length) {
    var snap = grid.snapPointToGrid(pt);

    if (snap.p) {
      anchor.x = snap.p.x;
      anchor.y = snap.p.y;

      if (snap.a && snap.b) {
        grid.joinNodes(anchor.id, snap.a.id);
        grid.joinNodes(anchor.id, snap.b.id);
        cells = grid.cellsWithEdge(snap.a, snap.b);
      }
    }
  }

  // Attach node to related polygon geometry:
  if (cells.length) {
    cells.forEach(cell => {
      cell.rels.forEach(rel => grid.joinNodes(anchor.id, rel));
    });
  }

  return anchor;
}