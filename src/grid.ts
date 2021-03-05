import { Cell } from './gridCell';
import { Node } from './gridNode';
import { Path } from './gridPath';
import { Point } from './point';
import { Rect } from './rect';
import { NodeCostComparator, PathSelector } from './types';
import {
  uuidv4,
  snapPointToLineSegment,
  boundingRectForPoints,
  nearestPointToPoint,
  hitTestPointRing,
} from './utils';

interface GridData {
  nodes: Array<{ id: string, x: number, y: number, to: Array<string>, data?: Record<any, any> }>,
  cells: Array<{ id: string, rels: Array<string>, data?: Record<any, any> }>,
}

function isSameLineSegment(a: Node, b: Node, c: Node, d: Node): boolean {
  return (a.id === c.id && b.id === d.id) || (a.id === d.id && b.id === c.id);
}

export class Grid {
  private nodes: Record<string, Node> = Object.create(null);
  private cells: Record<string, Cell> = Object.create(null);

  constructor(data?: GridData) {
    this.reset(data);
  }

  // Creates a raw data representation of the grid.
  toConfig(): GridData {
    return {
      nodes: Object.values(this.nodes).map(n => n.toConfig()),
      cells: Object.values(this.cells).map(n => n.toConfig()),
    };
  }

  // Clears all existing node and polygon references from the grid.
  reset(data?: GridData): void {
    this.nodes = Object.create(null);
    this.cells = Object.create(null);
    if (data) {
      data.nodes.forEach(n => {
        this.nodes[n.id] = new Node(n.id, n.x, n.y, n.to, n.data);
      });
      data.cells.forEach(c => {
        const invalid = c.rels.find(rel => !this.getNode(rel));
        if (invalid) {
          throw new Error(`Cell "${c.id}" contains invalid relation "${invalid}"`);
        }
        this.cells[c.id] = new Cell(c.id, c.rels, c.data);
      });
    }
  }

  addNode(x: number=0, y: number=0, data?: Record<any, any>): Node {
    const node = new Node(data?.id ?? uuidv4(), x, y, [], data);
    this.nodes[node.id] = node;
    return node;
  }

  // Counts the number of nodes defined within the grid.
  get nodeCount() {
    return Object.keys(this.nodes).length;
  }

  // Gets a node by id reference.
  getNode(id: string): Node {
    return this.nodes[id];
  }

  // Tests if a node id or array of node ids are defined.
  hasNodes(ids: Array<string>): boolean {
    return ids.every(id => !!this.getNode(id));
  }

  // Joins nodes within a selection group.
  // Selection group may be an array of node ids, or an object of id keys.
  joinNodes(ids: Array<string>): boolean {
    let changed = false;

    // Group must contain two or more nodes to join...
    if (ids.length > 1 && this.hasNodes(ids)) {

      // Loop through selection group of nodes...
      ids.forEach(id => {
        const node = this.getNode(id) as Node;
        ids.forEach(refId => {
          if (id !== refId) {
            node.to[refId] = true;
            changed = true;
          }
        });
      });
    }

    return changed;
  }

  // Splits apart nodes within a selection group.
  // Selection group may be an array of node ids, or an object of id keys.
  splitNodes(ids: Array<string>): boolean {
    // Alias 'detach' method for a single node reference.
    if (ids.length < 2) {
      return this.detachNodes(ids);
    }

    let changed = false;

    // Decouple group node references.
    ids.forEach(id => {
      const node = this.getNode(id);
      if (node) {
        ids.forEach(refId => {
          if (node.to[refId]) {
            delete node.to[refId];
            changed = true;
          }
        });
      }
    });

    return changed;
  }

  // Detachs a node from the grid.
  // Each node's connections will be severed from all joining nodes.
  detachNodes(ids: Array<string>): boolean {
    let changed = false;

    ids.forEach(id => {
      const node = this.getNode(id);
      if (node) {
        Object.keys(node.to).forEach(relId => {
          const relNode = this.getNode(relId);
          if (relNode) {
            delete relNode.to[id];
          }

          delete node.to[relId];
          changed = true;
        });
      }
    });

    return changed;
  }

  // Detaches and removes a collection of nodes from the grid.
  removeNodes(ids: Array<string>): boolean {
    let changed = this.detachNodes(ids);

    ids.forEach(id => {
      if (this.getNode(id)) {
        Object.entries(this.cells).forEach(([cid, cell]) => {
          if (cell.rels.some(nid => nid === id)) {
            delete this.cells[cid];
          }
        });

        delete this.nodes[id];
        changed = true;
      }
    });

    return changed;
  }

  // Adds a polygon to the grid, formed by a collection of node ids.
  addCell(rels: Array<string>, data?: Record<any, any>): Cell | null {
    if (rels.length >= 3 && this.hasNodes(rels)) {
      const key = rels.slice().sort().join('/');
      const existing = Object.values(this.cells).find(c => c.rels.slice().sort().join('/') === key);
      if (existing) {
        return existing;
      }

      const cell = new Cell(data?.id ?? uuidv4(), rels, data);
      this.cells[cell.id] = cell;
      return cell;
    }
    return null;
  }

  // Gets a polygon by id reference.
  getCell(id: string): Cell {
    return this.cells[id];
  }

  // Gets an array of nodes representing a polygon in the grid.
  nodesForCell(id: string): Array<Node> {
    const cell = this.getCell(id);
    return cell ? cell.rels.map(id => this.getNode(id)) : [];
  }

  // Counts the number of polygons defined in the grid.
  get cellCount(): number {
    return Object.keys(this.cells).length;
  }

  // Removes a collection of polygons from the grid.
  removeCells(ids: Array<string>): boolean {
    let changed = false;

    ids.forEach(id => {
      if (this.getCell(id)) {
        delete this.cells[id];
        changed = true;
      }
    });

    return changed;
  }

  // Finds the lowest cost path between two nodes among the grid of nodes.
  // @param start: The node id within the seach grid to start at.
  // @param goal: The node id within the search grid to reach via lowest cost path.
  // @return: Path found to goal
  findPath({
    start,
    goal,
    costForSegment = Point.distance,
    costEstimateToGoal = Point.distance,
    bestCandidatePath = (a, _b) => a,
  }: {
    start: string,
    goal: string,
    costForSegment?: NodeCostComparator,
    costEstimateToGoal?: NodeCostComparator,
    bestCandidatePath?: PathSelector,
  }): Path | null {

    const queue: Array<Path> = [];
    const bestWeights: Record<string, number> = Object.create(null);
    const startNode: Node = this.getNode(start);
    const goalNode: Node = this.getNode(goal);
    let bestPath: Path | undefined = undefined;

    // Create initial search path with default weight from/to self.
    queue.push(new Path([startNode], costForSegment(startNode, startNode)));

    // While the queue contains paths:
    while (queue.length > 0) {
      const currentPath = queue.pop() as Path;
      const lastNode = currentPath.nodes[currentPath.nodes.length-1];

      // Extend search path outward to the next set of connections, creating X new paths.
      Object.keys(lastNode.to).forEach(id => {
        const currentNode = this.getNode(id);

        // Reject loops.
        if (currentNode && !currentPath.nodes.find(n => n.id === currentNode.id)) {
          const branchWeight = currentPath.weight + costForSegment(lastNode, currentNode);

          // Test branch fitness.
          if (branchWeight <= (bestWeights[currentNode.id] || branchWeight)) {
            bestWeights[currentNode.id] = branchWeight;
            const branchEstimate = branchWeight + (currentNode !== goalNode ? costEstimateToGoal(currentNode, goalNode) : 0);

            // Test for viable path to goal.
            if (bestPath == null || branchEstimate <= bestPath.weight) {

              // Create a new branch path extended to search node.
              const branchPath = currentPath.copy(branchWeight, branchEstimate);
              branchPath.nodes.push(currentNode);

              // Test if goal has been reached.
              if (currentNode.id === goalNode.id) {
                // Retain best completed path.
                bestPath = bestPath ? bestCandidatePath(bestPath, branchPath) : branchPath;
              } else {
                // Queue additional search path.
                queue.push(branchPath);
              }
            }
          }
        }
      });

      // Sort queue by estimate to complete, highest to lowest.
      queue.sort((a, b) => b.estimate - a.estimate);
    }

    return bestPath ?? null;
  }

  // Snaps the provided point to the nearest position within the node grid.
  // @param pt  The point to snap into the grid.
  snapPointToGrid(pt: Point): {
    p: Point,
    a: Node | null,
    b: Node | null,
  } {
    let p: Point | null = null;
    let a: Node | null = null;
    let b: Node | null = null;
    let bestDistance: number = Infinity;
    const tested: Record<any, boolean> = Object.create(null);

    Object.values(this.nodes).forEach(node => {
      Object.keys(node.to).forEach(relId => {
        if (!tested[`${relId} ${node.id}`]) {
          tested[`${node.id} ${relId}`] = true;
          const rel = this.getNode(relId);
          const snapped = snapPointToLineSegment(pt, node, rel);
          const offset = Point.distance(pt, snapped);

          if (p == null || offset < bestDistance) {
            bestDistance = offset;
            p = snapped;
            a = node;
            b = rel;
          }
        }
      });
    });

    return {
      p: p ?? pt,
      a,
      b,
    };
  }

  // Finds the nearest node to the specified node.
  // @param origin: The origin node to search from.
  // @return: The nearest other grid node to the specified target.
  nearestNodeToNode(id: string): Node | null {
    const node = this.getNode(id);
    const candidates = Object.values(this.nodes).filter(n => n.id !== id);
    return node && candidates.length ? nearestPointToPoint(node, candidates) as Node : null;
  }

  // Finds the nearest node to a specified point within the grid.
  // @param pt: Point to test.
  // @return: Nearest Node to target Point.
  nearestNodeToPoint(pt: Point): Node | null {
    return nearestPointToPoint(pt, Object.values(this.nodes)) as Node;
  }

  // Tests a Point for intersections with all Cells in the grid, and returns their ids.
  // @param pt  The point to snap into the grid.
  // @return  Array of Cell ids that hit the specified Point.
  cellsContainingPoint(pt: Point): Array<Cell> {
    return Object.values(this.cells).reduce((acc: Array<Cell>, cell: Cell) => {
      const ring = cell.rels.map(id => this.getNode(id));
      if (boundingRectForPoints(ring).hitTest(pt) && hitTestPointRing(pt, ring)) {
        acc.push(cell);
      }
      return acc;
    }, []);
  }

  // Tests a Cell for intersections with all nodes in the grid, and returns their ids.
  // @param id  The polygon id to test.
  // @return  Array of node ids that fall within the specified Cell.
  nodesInCell(id: string): Array<Node> {
    const nodes: Array<Node> = [];
    const cell = this.getCell(id);

    if (cell) {
      const ring = cell.rels.map(id => this.getNode(id));
      const rect = boundingRectForPoints(ring);
      Object.values(this.nodes).forEach(node => {
        // Run incrementally costly tests:
        // - node in cell ring?
        // - OR...
        // node in rect AND node within ring?
        if (cell.rels.includes(node.id) || (rect.hitTest(node) && hitTestPointRing(node, ring))) {
          nodes.push(node);
        }
      });
    }

    return nodes;
  }

  // Tests a Rect for intersections with all nodes in the grid, and returns their ids.
  // @param id  The polygon id to test.
  // @return  Array of node ids that fall within the specified Rect.
  nodesInRect(rect: Rect): Array<Node> {
    return Object.values(this.nodes).reduce((acc: Array<Node>, node: Node) => {
      if (rect.hitTest(node)) {
        acc.push(node);
      }

      return acc;
    }, []);
  }

  // Finds all adjacent line segments shared by two polygons.
  // @param p1  First polygon to compare.
  // @param p2  Second polygon to compare.
  // @returns  Array of line segments.
  getAdjacentCellSegments(c1: string, c2: string): Array<{ a: Node, b: Node }> {
    const result: Array<{ a: Node, b: Node }> = [];
    const ring1 = this.getCell(c1).rels.map(id => this.getNode(id));
    const ring2 = this.getCell(c2).rels.map(id => this.getNode(id));

    ring1.forEach((a, i) => {
      const b = ring1[(i+1) % ring1.length];

      ring2.forEach((c, j) => {
        const d = ring2[(j+1) % ring2.length];

        if (isSameLineSegment(a, b, c, d)) {
          result.push({ a, b });
        }
      });
    });

    return result;
  }
}
