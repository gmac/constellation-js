import Cell from './gridCell';
import Node from './gridNode';
import Path from './gridPath';
import Point from './point';
import { NodeCostComparator, PathSelector } from './types';
import { uuidv4 } from './utils';

interface GridData {
  nodes: Array<{ id: string, x: number, y: number, to: Array<string>, data?: Record<any, any> }>,
  cells: Array<{ id: string, rels: Array<string>, data?: Record<any, any> }>,
}

export default class Grid {
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
    const node = new Node(uuidv4(), x, y, [], data);
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
  splitNodes(ids: Array<string>) {
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
  detachNodes(ids: Array<string>) {
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
  removeNodes(ids: Array<string>) {
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

      const cell = new Cell(uuidv4(), rels, data);
      this.cells[cell.id] = cell;
      return cell;
    }
    return null;
  }

  // Gets a polygon by id reference.
  getCell(id: string): Cell {
    return this.cells[id];
  }

  // Gets a collection of polygons by id references.
  getCells(ids: Array<string>): Array<Cell> {
    return ids.map(id => this.getCell(id));
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

  // Finds the shortest path between two nodes among the grid of nodes.
  // @param start: The node id within the seach grid to start at.
  // @param goal: The node id within the search grid to reach via shortest path.
  // @attr this.nodes: The grid of nodes to search, formatted as:
  /* {
    n1: {id:"n1", x:25, y:25, to:{n2:1, n3:1}},
    n2: {id:"n2", x:110, y:110, to:{n1:1}},
    n3: {id:"n3", x:50, y:180, to:{n1:1}},
  };*/
  // @return: A report on the search, including:
  //  @attr length: length of completed path.
  //  @attr cycles: number of cycles required to complete the search.
  //  @attr nodes: an array of path nodes, formatted as [startNode, ...connections, goalNode].
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
    queue.push(new Path([startNode], costForSegment(startNode, startNode), costEstimateToGoal(startNode, goalNode)));

    // While the queue contains paths:
    while (queue.length > 0) {
      let currentPath = queue.pop() as Path;
      let prevNode = currentPath.nodes[currentPath.nodes.length-1];

      // Extend search path outward to the next set of connections, creating X new paths.
      Object.keys(prevNode.to).forEach(id => {
        const currentNode = this.getNode(id);

        // Reject loops.
        if (currentNode && !currentPath.nodes.find(n => n.id === currentNode.id)) {
          const branchWeight = currentPath.weight + costForSegment(prevNode, currentNode);

          // Test branch fitness.
          if (branchWeight <= (bestWeights[currentNode.id] || branchWeight)) {
            bestWeights[currentNode.id] = branchWeight;
            const branchEstimate = branchWeight + costEstimateToGoal(currentNode, goalNode);

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

  // // Finds a path between two points with the fewest number of connections.
  // findPathWithFewestNodes(options: {
  //   start: string,
  //   goal: string,
  //   tiebreakerFunction?: PathSelector
  // }): Path {
  //   const step = () => 1;
  //   return this.findPath({ ...options,  });
  // }

  // // Snaps the provided point to the nearest position within the node grid.
  // // @param pt  The point to snap into the grid.
  // // @param meta  Specify true to return full meta data on the snapped point/segment.
  // // @return  A new point with the snapped position, or the original point if no grid was searched.
  // snapPointToGrid: function(pt) {
  //   var bestPoint = null;
  //   var bestDistance = Infinity;
  //   var bestSegment = [];
  //   var tested = {};

  //   _c.each(this.nodes, function(local, id) {
  //     if (pt.id === id) return;

  //     // Loop through each node's connections.
  //     for (var i in local.to) {
  //       if (local.to.hasOwnProperty(i) && !tested.hasOwnProperty(i+' '+local.id)) {
  //         var foreign = this.nodes[i];
  //         var snapped = Const.snapPointToLineSegment(pt, local, foreign);
  //         var offset = Const.distance(pt, snapped);
  //         tested[local.id+' '+foreign.id] = true;

  //         if (!bestPoint || offset < bestDistance) {
  //           bestPoint = snapped;
  //           bestDistance = offset;
  //           bestSegment[0] = local.id;
  //           bestSegment[1] = foreign.id;
  //         }
  //       }
  //     }
  //   }, this);

  //   return {
  //     offset: isFinite(bestDistance) ? bestDistance : 0,
  //     point: bestPoint || pt,
  //     segment: bestSegment
  //   };
  // },

  // snapPoint: function(pt) {
  //   var snapped = this.snapPointToGrid(pt);
  //   return snapped.point || pt;
  // },

  // // Finds the nearest node to the specified node.
  // // @param origin: The origin node to search from.
  // // @return: The nearest other grid node to the specified target.
  // getNearestNodeToNode: function(id) {
  //   var nodes = [];
  //   var target = this.getNodeById(id);

  //   if (target) {
  //     _c.each(this.nodes, function(node) {
  //       if (node.id !== target.id) {
  //         nodes.push(node);
  //       }
  //     }, this);

  //     return Const.getNearestPointToPoint(target, nodes);
  //   }
  //   return null;
  // },

  // // Finds the nearest node to a specified point within the grid.
  // // @param pt: Point to test.
  // // @return: Nearest Node to target Point.
  // getNearestNodeToPoint: function(pt) {
  //   return Const.getNearestPointToPoint(pt, Object.value(this.nodes));
  // },

  // // Tests if a Point intersects any Cell in the grid.
  // // @param pt: Point to test.
  // // @return: True if the point intersects any polygon.
  // hitTestPointInCells: function(pt) {
  //   return !!this.getCellsOverPoint(pt).length;
  // },

  // // Tests a Point for intersections with all Cells in the grid, and returns their ids.
  // // @param pt  The point to snap into the grid.
  // // @return  Array of Cell ids that hit the specified Point.
  // getCellsOverPoint: function(pt) {
  //   var hits = [];
  //   for (var id in this.cells) {
  //     if (this.cells.hasOwnProperty(id) && Const.hitTestPointRing(pt, this.getNodesForCell(id))) {
  //       hits.push(id);
  //     }
  //   }
  //   return hits;
  // },

  // // Tests a Cell for intersections with all nodes in the grid, and returns their ids.
  // // @param id  The polygon id to test.
  // // @return  Array of node ids that fall within the specified Cell.
  // getNodesInCell: function(id) {
  //   var hits = [];
  //   var poly = this.getCellById(id);
  //   var points = this.getNodesForCell(id);
  //   var rect = Const.getRectForPointRing(points);

  //   if (poly) {
  //     _c.each(this.nodes, function(node) {
  //       // Run incrementally costly tests:
  //       // - node in shape?
  //       // - OR...
  //       // node in rect AND node within ring?
  //       if (_c.contains(poly.nodes, node.id) || (rect.hitTest(node) && Const.hitTestPointRing(node, points))) {
  //         hits.push(node.id);
  //       }
  //     }, this);
  //   }

  //   return hits;
  // },

  // // Tests a Rect for intersections with all nodes in the grid, and returns their ids.
  // // @param id  The polygon id to test.
  // // @return  Array of node ids that fall within the specified Rect.
  // getNodesInRect: function(rect) {
  //   var hits = [];

  //   _c.each(this.nodes, function(node) {
  //     if (rect.hitTest(node)) {
  //       hits.push(node.id);
  //     }
  //   }, this);

  //   return hits;
  // },

  // // Finds all adjacent line segments shared by two polygons.
  // // @param p1  First polygon to compare.
  // // @param p2  Second polygon to compare.
  // // @returns  Array of arrays, each containing two node ids for a line segment.
  // getAdjacentCellSegments: function(p1, p2) {
  //   var result = [];
  //   var ring1 = this.getNodesForCell(p1);
  //   var ring2 = this.getNodesForCell(p2);
  //   var len1 = ring1.length;
  //   var len2 = ring2.length;

  //   for (var i=0; i < len1; i++) {
  //     var a1 = ring1[i].id;
  //     var b1 = ring1[(i+1) % len1].id;

  //     for (var j=0; j < len2; j++) {
  //       var a2 = ring2[j].id;
  //       var b2 = ring2[(j+1) % len2].id;

  //       if (isSameSegment(a1, b1, a2, b2)) {
  //         result.push([a1, b1]);
  //       }
  //     }
  //   }
  //   return result;
  // },

  // // Gets an array of polygon ids that contain the specified line segment:
  // getCellsWithLineSegment: function(n1, n2) {
  //   var result = [];

  //   _c.each(this.cells, function(poly, id) {
  //     // Loop through all polygon ring node pairs:
  //     for (var i=0, len=poly.nodes.length; i < len; i++) {
  //       var a = poly.nodes[i];
  //       var b = poly.nodes[(i+1) % len];

  //       // Retain polygon id if it matches the specified segment:
  //       if (isSameSegment(a, b, n1, n2)) {
  //         result.push(id);
  //       }
  //     }
  //   });
  //   return result;
  // },

  // // Maps the grid into descrete node fragments.
  // // Each fragment contains the IDs of contiguously joined nodes.
  // getContiguousNodesMap: function() {
  //   var fragments = [];
  //   var mapped = {};
  //   var grid = this;

  //   function followNode(node, fragment) {
  //     // Record node as mapped and belonging to the current fragment:
  //     mapped[node.id] = fragment[node.id] = 1;

  //     for (var id in node.to) {
  //       if (node.to.hasOwnProperty(id) && !fragment.hasOwnProperty(id)) {
  //         fragment = followNode(grid.getNodeById(id), fragment);
  //       }
  //     }
  //     return fragment;
  //   }

  //   _c.each(this.nodes, function(node) {
  //     if (!mapped.hasOwnProperty(node.id)) {
  //       fragments.push(followNode(node, {}));
  //     }
  //   });

  //   return fragments;
  // },

  // // Creates a path between two external (non-grid) points, using the grid to navigate between them.
  // // Start and goal points will be integrated as best as possible into the grid, then route between.
  // // @param a  Starting Point object to path from.
  // // @param b  Goal Point object to bridge to.
  // // @param confineToGrid  Specify TRUE to lock final route point to within the grid.
  // // @return  an array of Point objects specifying a path to follow.
  // bridgePoints: function(a, b, confineToGrid) {

  //   // 1) Connect points through common polygon.
  //   // 2) Connect points through adjacent polygon.
  //   // 3) Snap points to grid, connect anchors to segment and related cells.
  //   // 4) Direct connect points on common line segment.
  //   // 5) Direct connect points in common polygon.

  //   // Connect points through a common polygon:
  //   // Get polygon intersections for each point.
  //   var cellsA = this.getCellsOverPoint(a);
  //   var cellsB = this.getCellsOverPoint(b);

  //   // Test if points can be bridged through the polygon grid:
  //   // If so, a direction connection can be made.
  //   if (testBridgeViaPolys(this, a, b, cellsA, cellsB)) {
  //     return [a, b];
  //   }

  //   // Connect temporary anchors to the node grid via polygons:
  //   var anchorA = createBridgeAnchor(this, a, cellsA);
  //   var anchorB = createBridgeAnchor(this, b, cellsB);

  //   if (testBridgeViaAnchors(anchorA, anchorB)) {
  //     this.joinNodes(anchorA.id, anchorB.id);
  //   }

  //   // Find path then remove nodes:
  //   var path = this.findPath(anchorA.id, anchorB.id);
  //   this.removeNodes(anchorA.id, anchorB.id);

  //   if (path.valid) {
  //     path = _c.map(path.nodes, function(node) {
  //       return node.toPoint();
  //     });

  //     // Add start point:
  //     if (Const.distance(a, anchorA) > 1) {
  //       path.unshift(a);
  //     }

  //     // Add goal point:
  //     if (!confineToGrid && Const.distance(b, anchorB) > 1) {
  //       path.push(b);
  //     }

  //     return path;
  //   }

  //   // Return empty array if errors were encountered:
  //   return [];
  // }
}
