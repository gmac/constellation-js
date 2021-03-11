import { Grid } from './grid';
import { Node } from './gridNode';
import { Cell } from './gridCell';
import { Point } from './point';
import { compositeId } from './utils';

export class ExtendedGrid {
  private grid: Grid;

  constructor(grid: Grid) {
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
    const cellsA = this.grid.cellsContainingPoint(a);
    const cellsB = this.grid.cellsContainingPoint(b);

    // Test if points can be bridged through the polygon grid:
    // If so, a direction connection can be made.
    // @todo – needs a polygon union with edge intersections
    if (cellsA.find(cell => cellsB.includes(cell))) {
      return [a, b];
    }

    // Connect temporary anchors to the node grid via polygons:
    const anchorA = this.addRouteAnchor(a, cellsA);
    const anchorB = this.addRouteAnchor(b, cellsB, anchorA);
    const path = this.grid.findPath({ start: anchorA.id, goal: anchorB.id });
    this.grid.removeNodes([anchorA.id, anchorB.id]);

    if (path) {
      const points: Array<Point> = path.nodes.map(n => new Point(n.x, n.y));

      if (Point.distance(a, anchorA) > 0) {
        points.unshift(a);
      }

      if (!confineToGrid && Point.distance(b, anchorB) > 0) {
        points.push(b);
      }

      return points;
    }

    return [];
  }

  addRouteAnchor(pt: Point, cells: Array<Cell> = [], prevAnchor?: Node): Node {
    const anchor: Node = this.grid.addNode(pt.x, pt.y);
    let edge: string | undefined = undefined;

    // Attach to grid if there are no polygons to hook into:
    // this may generate some new polygons for the point.
    if (!cells.length) {
      const segment = this.grid.snapPointToGrid(pt);
      anchor.x = segment.p.x;
      anchor.y = segment.p.y;

      if (segment.a != null && segment.b != null) {
        this.grid.joinNodes([anchor.id, segment.a.id]);
        this.grid.joinNodes([anchor.id, segment.b.id]);
        cells = this.grid.cellsWithEdge(segment.a, segment.b);
        edge = compositeId([segment.a.id, segment.b.id]);

        if (edge === prevAnchor?.data?.edge) {
          this.grid.joinNodes([anchor.id, prevAnchor.id]);
        }
      }
    }

    // Attach node to related cell geometry:
    cells.forEach(cell => {
      cell.rels.forEach(rel => this.grid.joinNodes([anchor.id, rel]));
    });

    // Attach directly to previous anchor when possible
    if (prevAnchor?.data?.cells?.some((c: Cell) => cells.includes(c))) {
      this.grid.joinNodes([anchor.id, prevAnchor.id]);
    }

    anchor.data = { cells, edge };
    return anchor;
  }
}
