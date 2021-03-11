(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Constellation = {}));
}(this, (function (exports) { 'use strict';

  var Point = /** @class */ (function () {
      function Point(x, y, data) {
          if (x === void 0) { x = 0; }
          if (y === void 0) { y = 0; }
          this.x = x;
          this.y = y;
          this.data = data;
      }
      // Find the distance between two points.
      Point.distance = function (a, b) {
          return Math.sqrt(Point.distance2(a, b));
      };
      // A cheaper version of distance squared, for heuristics
      Point.distance2 = function (a, b) {
          var x = b.x - a.x;
          var y = b.y - a.y;
          return x * x + y * y;
      };
      return Point;
  }());

  var Rect = /** @class */ (function () {
      function Rect(x, y, w, h) {
          if (x === void 0) { x = 0; }
          if (y === void 0) { y = 0; }
          if (w === void 0) { w = 0; }
          if (h === void 0) { h = 0; }
          this.x = x;
          this.y = y;
          this.width = w;
          this.height = h;
      }
      Rect.prototype.hitTest = function (p) {
          var minX = Math.min(this.x, this.x + this.width);
          var maxX = Math.max(this.x, this.x + this.width);
          var minY = Math.min(this.y, this.y + this.height);
          var maxY = Math.max(this.y, this.y + this.height);
          return p.x >= minX && p.y >= minY && p.x <= maxX && p.y <= maxY;
      };
      return Rect;
  }());

  function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
  }
  function compositeId(ids) {
      return ids.slice().sort().join('/');
  }
  // Test if point Z is left|on|right of an infinite 2D line.
  // > 0 left, = 0 on, < 0 right
  function cross(x, y, z) {
      return (y.x - x.x) * (z.y - x.y) - (z.x - x.x) * (y.y - x.y);
  }
  // Tests for counter-clockwise winding among three points.
  // @param x: Point X of triangle XYZ.
  // @param y: Point Y of triangle XYZ.
  // @param z: Point Z of triangle XYZ.
  // @param exclusive boolean: when true, equal points will be excluded from the test.
  function ccw(x, y, z) {
      return cross(x, y, z) < 0;
  }
  // Tests for intersection between line segments AB and CD.
  // @param a: Point A of line AB.
  // @param b: Point B of line AB.
  // @param c: Point C of line CD.
  // @param d: Point D of line CD.
  // @return: true if AB intersects CD.
  function intersect(a, b, c, d) {
      return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
  }
  // Convert degrees to radians.
  // @param degrees value.
  // @return radians equivalent.
  function degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
  }
  // Convert radians to degrees.
  // @param radians value.
  // @return degrees equivalent.
  function radiansToDegrees(radians) {
      return radians * 180 / Math.PI;
  }
  // Calculates the angle (in radians) between line segment AB and the positive X-origin.
  // @param a: Point A of line AB.
  // @param b: Point B of line AB.
  // @return angle (in radians).
  function angleRadians(a, b) {
      return Math.atan2(b.y - a.y, b.x - a.x);
  }
  // Calculates the angle (in degrees) between line segment AB and the positive X-origin.
  // Degree value is adjusted to fall within a 0-360 range.
  // @param a: Point A of line AB.
  // @param b: Point B of line AB.
  // @return: angle degrees (0-360 range)
  function angleDegrees(a, b) {
      var degrees = radiansToDegrees(angleRadians(a, b));
      return degrees < 0 ? degrees + 360 : degrees;
  }
  // Gets the index of the circle sector that an angle falls into.
  // This is useful for applying view states to a graphic while moving it around the grid.
  // Ex: create 8 walk cycles
  // @param radians: angle radians to test.
  // @param sectors: number of sectors to divide the circle into. Default is 8.
  // @param offset: offsets the origin of the sector divides within the circle. Default is PI*2/16.
  // @return sector index (a number between 0 and X-1, where X is number of sectors).
  function angleSector(radians, sectors, offset) {
      if (sectors === void 0) { sectors = 8; }
      var circ = Math.PI * 2;
      offset = offset || circ / (sectors * 2);
      if (radians < 0) {
          radians = circ + radians;
      }
      radians += offset;
      if (radians > circ) {
          radians -= circ;
      }
      return Math.floor(radians / (circ / sectors));
  }
  // Gets the rectangular bounds of a point ring.
  // @param points: The ring of points to measure bounding on.
  // @return: a new Rect object of the ring's maximum extent.
  function boundingRectForPoints(points) {
      if (!points.length) {
          return new Rect(0, 0, 0, 0);
      }
      var minX = points[0].x;
      var maxX = points[0].x;
      var minY = points[0].y;
      var maxY = points[0].y;
      points.forEach(function (pt) {
          minX = Math.min(minX, pt.x);
          maxX = Math.max(maxX, pt.x);
          minY = Math.min(minY, pt.y);
          maxY = Math.max(maxY, pt.y);
      });
      return new Rect(minX, minY, maxX - minX, maxY - minY);
  }
  // Tests if point P falls within a polygonal region; test performed by ray casting.
  // @param p: The point to test.
  // @param points: An array of points forming a polygonal shape.
  // @return: true if point falls within point ring.
  function hitTestPointRing(p, points) {
      var wn = 0; // winding number
      points.forEach(function (a, i) {
          var b = points[(i + 1) % points.length];
          if (a.y <= p.y) {
              if (b.y > p.y && cross(a, b, p) > 0) {
                  wn += 1;
              }
          }
          else if (b.y <= p.y && cross(a, b, p) < 0) {
              wn -= 1;
          }
      });
      return wn !== 0;
  }
  // Snaps point P to the nearest position along line segment AB.
  // @param p: Point P to snap to line segment AB.
  // @param a: Point A of line segment AB.
  // @param b: Point B of line segment AB.
  // @return: new Point object with snapped coordinates.
  function snapPointToLineSegment(p, a, b) {
      var ap1 = p.x - a.x;
      var ap2 = p.y - a.y;
      var ab1 = b.x - a.x;
      var ab2 = b.y - a.y;
      var mag = ab1 * ab1 + ab2 * ab2;
      var dot = ap1 * ab1 + ap2 * ab2;
      var t = dot / mag;
      if (t < 0) {
          return new Point(a.x, a.y);
      }
      else if (t > 1) {
          return new Point(b.x, b.y);
      }
      return new Point(a.x + ab1 * t, a.y + ab2 * t);
  }
  // Finds the nearest point within an array of points to target P.
  // @param p: Point P to test against.
  // @param points: Array of Points to find the nearest point within.
  // @return: nearest Point to P, or null if no points were available.
  function nearestPointToPoint(p, points) {
      var bestPt = null;
      var bestDist = Infinity;
      // Sort points by horizontal offset from P.
      points = points.slice().sort(function (a, b) { return Math.abs(p.x - b.x) - Math.abs(p.x - a.x); });
      for (var i = points.length - 1; i >= 0; i -= 1) {
          var a = points[i];
          if (Math.abs(p.x - a.x) < bestDist) {
              var dist = Point.distance2(p, a);
              if (dist < bestDist) {
                  bestPt = a;
                  bestDist = dist;
              }
          }
          else {
              break;
          }
      }
      return bestPt;
  }

  var ExtendedGrid = /** @class */ (function () {
      function ExtendedGrid(grid) {
          this.grid = grid;
      }
      // Creates a path between two external (non-grid) points, using the grid to navigate between them.
      // Start and goal points will be integrated as best as possible into the grid, then route between.
      // @param a  Starting Point object to path from.
      // @param b  Goal Point object to bridge to.
      // @param confineToGrid  Specify TRUE to lock final route point to within the grid.
      // @return  an array of Point objects specifying a path to follow.
      ExtendedGrid.prototype.route = function (a, b, confineToGrid) {
          // 1) Connect points through common polygon (todo: region).
          // 3) Snap points to grid, connect anchors to segment and related polys.
          // 4) Direct connect points on common line segment.
          // 5) Direct connect points in common polygon.
          if (confineToGrid === void 0) { confineToGrid = true; }
          // Connect points through a common polygon:
          // Get polygon intersections for each point.
          var cellsA = this.grid.cellsContainingPoint(a);
          var cellsB = this.grid.cellsContainingPoint(b);
          // Test if points can be bridged through the polygon grid:
          // If so, a direction connection can be made.
          // @todo – needs a polygon union with edge intersections
          if (cellsA.find(function (cell) { return cellsB.includes(cell); })) {
              return [a, b];
          }
          // Connect temporary anchors to the node grid via polygons:
          var anchorA = this.addRouteAnchor(a, cellsA);
          var anchorB = this.addRouteAnchor(b, cellsB, anchorA);
          var path = this.grid.findPath({ start: anchorA.id, goal: anchorB.id });
          this.grid.removeNodes([anchorA.id, anchorB.id]);
          if (path) {
              var points = path.nodes.map(function (n) { return new Point(n.x, n.y); });
              if (Point.distance(a, anchorA) > 0) {
                  points.unshift(a);
              }
              if (!confineToGrid && Point.distance(b, anchorB) > 0) {
                  points.push(b);
              }
              return points;
          }
          return [];
      };
      ExtendedGrid.prototype.addRouteAnchor = function (pt, cells, prevAnchor) {
          var _this = this;
          var _a, _b, _c;
          if (cells === void 0) { cells = []; }
          var anchor = this.grid.addNode(pt.x, pt.y);
          var edge = undefined;
          // Attach to grid if there are no polygons to hook into:
          // this may generate some new polygons for the point.
          if (!cells.length) {
              var segment = this.grid.snapPointToGrid(pt);
              anchor.x = segment.p.x;
              anchor.y = segment.p.y;
              if (segment.a != null && segment.b != null) {
                  this.grid.joinNodes([anchor.id, segment.a.id]);
                  this.grid.joinNodes([anchor.id, segment.b.id]);
                  cells = this.grid.cellsWithEdge(segment.a, segment.b);
                  edge = compositeId([segment.a.id, segment.b.id]);
                  if (edge === ((_a = prevAnchor === null || prevAnchor === void 0 ? void 0 : prevAnchor.data) === null || _a === void 0 ? void 0 : _a.edge)) {
                      this.grid.joinNodes([anchor.id, prevAnchor.id]);
                  }
              }
          }
          // Attach node to related cell geometry:
          cells.forEach(function (cell) {
              cell.rels.forEach(function (rel) { return _this.grid.joinNodes([anchor.id, rel]); });
          });
          // Attach directly to previous anchor when possible
          if ((_c = (_b = prevAnchor === null || prevAnchor === void 0 ? void 0 : prevAnchor.data) === null || _b === void 0 ? void 0 : _b.cells) === null || _c === void 0 ? void 0 : _c.some(function (c) { return cells.includes(c); })) {
              this.grid.joinNodes([anchor.id, prevAnchor.id]);
          }
          anchor.data = { cells: cells, edge: edge };
          return anchor;
      };
      return ExtendedGrid;
  }());

  var Cell = /** @class */ (function () {
      function Cell(id, rels, data) {
          this.id = id;
          this.data = data;
          if (rels.length !== 3) {
              throw new Error('A cell requires exactly three node references');
          }
          this.rels = rels.slice();
          this.edges = rels.reduce(function (acc, a, i) {
              var b = rels[(i + 1) % rels.length];
              acc[compositeId([a, b])] = true;
              return acc;
          }, Object.create(null));
      }
      Cell.prototype.toConfig = function () {
          return {
              id: this.id,
              rels: this.rels,
              data: this.data,
          };
      };
      return Cell;
  }());

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var Node = /** @class */ (function (_super) {
      __extends(Node, _super);
      function Node(id, x, y, to, data) {
          if (x === void 0) { x = 0; }
          if (y === void 0) { y = 0; }
          if (to === void 0) { to = []; }
          var _this = _super.call(this, x, y, data) || this;
          _this.id = id;
          _this.to = to.reduce(function (memo, id) {
              memo[id] = true;
              return memo;
          }, Object.create(null));
          return _this;
      }
      Node.prototype.toConfig = function () {
          return {
              id: this.id,
              x: this.x,
              y: this.y,
              to: Object.keys(this.to),
              data: this.data,
          };
      };
      return Node;
  }(Point));

  var Path = /** @class */ (function () {
      function Path(nodes, weight, estimate) {
          if (nodes === void 0) { nodes = []; }
          if (weight === void 0) { weight = 0; }
          if (estimate === void 0) { estimate = 0; }
          this.nodes = nodes;
          this.weight = weight;
          this.estimate = estimate;
      }
      Path.prototype.copy = function (weight, estimate) {
          return new Path(this.nodes.slice(), weight !== null && weight !== void 0 ? weight : this.weight, estimate !== null && estimate !== void 0 ? estimate : this.estimate);
      };
      return Path;
  }());

  var Grid = /** @class */ (function () {
      function Grid(data) {
          this.nodes = Object.create(null);
          this.cells = Object.create(null);
          this.reset(data);
      }
      // Creates a raw data representation of the grid.
      Grid.prototype.toConfig = function () {
          return {
              nodes: Object.values(this.nodes).map(function (n) { return n.toConfig(); }),
              cells: Object.values(this.cells).map(function (n) { return n.toConfig(); }),
          };
      };
      // Clears all existing node and polygon references from the grid.
      Grid.prototype.reset = function (data) {
          var _this = this;
          this.nodes = Object.create(null);
          this.cells = Object.create(null);
          if (data) {
              data.nodes.forEach(function (n) {
                  _this.nodes[n.id] = new Node(n.id, n.x, n.y, n.to, n.data);
              });
              data.cells.forEach(function (c) {
                  var invalid = c.rels.find(function (rel) { return !_this.getNode(rel); });
                  if (invalid) {
                      throw new Error("Cell \"" + c.id + "\" contains invalid relation \"" + invalid + "\"");
                  }
                  _this.cells[c.id] = new Cell(c.id, c.rels, c.data);
              });
          }
      };
      Grid.prototype.addNode = function (x, y, data) {
          var _a;
          if (x === void 0) { x = 0; }
          if (y === void 0) { y = 0; }
          var node = new Node((_a = data === null || data === void 0 ? void 0 : data.id) !== null && _a !== void 0 ? _a : uuidv4(), x, y, [], data);
          this.nodes[node.id] = node;
          return node;
      };
      Object.defineProperty(Grid.prototype, "nodeCount", {
          // Counts the number of nodes defined within the grid.
          get: function () {
              return Object.keys(this.nodes).length;
          },
          enumerable: false,
          configurable: true
      });
      // Gets a node by id reference.
      Grid.prototype.getNode = function (id) {
          return this.nodes[id];
      };
      // Tests if a node id or array of node ids are defined.
      Grid.prototype.hasNodes = function (ids) {
          var _this = this;
          return ids.every(function (id) { return !!_this.getNode(id); });
      };
      // Joins nodes within a selection group.
      // Selection group may be an array of node ids, or an object of id keys.
      Grid.prototype.joinNodes = function (ids) {
          var _this = this;
          var changed = false;
          // Group must contain two or more nodes to join...
          if (ids.length > 1 && this.hasNodes(ids)) {
              // Loop through selection group of nodes...
              ids.forEach(function (id) {
                  var node = _this.getNode(id);
                  ids.forEach(function (rel) {
                      if (id !== rel) {
                          node.to[rel] = true;
                          changed = true;
                      }
                  });
              });
          }
          return changed;
      };
      // Splits apart nodes within a selection group.
      // Selection group may be an array of node ids, or an object of id keys.
      Grid.prototype.splitNodes = function (ids) {
          var _this = this;
          // Alias 'detach' method for a single node reference.
          if (ids.length < 2) {
              return this.detachNodes(ids);
          }
          var changed = false;
          var removedEdges = Object.create(null);
          // Decouple group node references.
          ids.forEach(function (id) {
              var node = _this.getNode(id);
              if (node) {
                  ids.forEach(function (rel) {
                      if (node.to[rel]) {
                          removedEdges[compositeId([id, rel])] = true;
                          delete node.to[rel];
                          changed = true;
                      }
                  });
              }
          });
          Object.keys(removedEdges).forEach(function (edge) {
              var cells = Object.values(_this.cells).filter(function (cell) { return !!cell.edges[edge]; });
              _this.removeCells(cells.map(function (c) { return c.id; }));
          });
          return changed;
      };
      // Detachs a node from the grid.
      // Each node's connections will be severed from all joining nodes.
      Grid.prototype.detachNodes = function (ids) {
          var _this = this;
          var changed = false;
          ids.forEach(function (id) {
              var node = _this.getNode(id);
              if (node) {
                  Object.keys(node.to).forEach(function (relId) {
                      var relNode = _this.getNode(relId);
                      if (relNode) {
                          delete relNode.to[id];
                      }
                      delete node.to[relId];
                      changed = true;
                  });
              }
          });
          return changed;
      };
      // Detaches and removes a collection of nodes from the grid.
      Grid.prototype.removeNodes = function (ids) {
          var _this = this;
          var changed = this.detachNodes(ids);
          ids.forEach(function (id) {
              if (_this.getNode(id)) {
                  Object.entries(_this.cells).forEach(function (_a) {
                      var cid = _a[0], cell = _a[1];
                      if (cell.rels.some(function (nid) { return nid === id; })) {
                          delete _this.cells[cid];
                      }
                  });
                  delete _this.nodes[id];
                  changed = true;
              }
          });
          return changed;
      };
      // Adds a polygon to the grid, formed by a collection of node ids.
      Grid.prototype.addCell = function (rels, data) {
          var _a;
          if (rels.length === 3 && this.hasNodes(rels)) {
              var key_1 = compositeId(rels);
              var existing = Object.values(this.cells).find(function (c) { return compositeId(c.rels) === key_1; });
              if (existing) {
                  return existing;
              }
              if (this.joinNodes(rels)) {
                  var a = rels[0], b = rels[1], c = rels[2];
                  // wind references counter-clockwise
                  if (cross(this.getNode(a), this.getNode(b), this.getNode(c)) > 0) {
                      rels = rels.reverse();
                  }
                  var cell = new Cell((_a = data === null || data === void 0 ? void 0 : data.id) !== null && _a !== void 0 ? _a : uuidv4(), rels, data);
                  this.cells[cell.id] = cell;
                  return cell;
              }
          }
          return null;
      };
      // Gets a polygon by id reference.
      Grid.prototype.getCell = function (id) {
          return this.cells[id];
      };
      // Gets an array of nodes representing a polygon in the grid.
      Grid.prototype.nodesForCell = function (id) {
          var _this = this;
          var cell = this.getCell(id);
          return cell ? cell.rels.map(function (id) { return _this.getNode(id); }) : [];
      };
      Object.defineProperty(Grid.prototype, "cellCount", {
          // Counts the number of polygons defined in the grid.
          get: function () {
              return Object.keys(this.cells).length;
          },
          enumerable: false,
          configurable: true
      });
      // Removes a collection of polygons from the grid.
      Grid.prototype.removeCells = function (ids) {
          var _this = this;
          var changed = false;
          ids.forEach(function (id) {
              if (_this.getCell(id)) {
                  delete _this.cells[id];
                  changed = true;
              }
          });
          return changed;
      };
      // Gets an array of cells that contain the specified edge segment:
      Grid.prototype.cellsWithEdge = function (n1, n2) {
          var edgeId = compositeId([n1.id, n2.id]);
          return Object.values(this.cells).filter(function (cell) { return !!cell.edges[edgeId]; });
      };
      // Finds the lowest cost path between two nodes among the grid of nodes.
      // @param start: The node id within the seach grid to start at.
      // @param goal: The node id within the search grid to reach via lowest cost path.
      // @return: Path found to goal
      Grid.prototype.findPath = function (_a) {
          var _this = this;
          var start = _a.start, goal = _a.goal, _c = _a.costForSegment, costForSegment = _c === void 0 ? Point.distance : _c, _d = _a.costEstimateToGoal, costEstimateToGoal = _d === void 0 ? Point.distance2 : _d, _e = _a.bestCandidatePath, bestCandidatePath = _e === void 0 ? function (a, _b) { return a; } : _e;
          var queue = [];
          var bestWeights = Object.create(null);
          var startNode = this.getNode(start);
          var goalNode = this.getNode(goal);
          var bestPath = undefined;
          // Create initial search path with default weight from/to self.
          queue.push(new Path([startNode], costForSegment(startNode, startNode)));
          var _loop_1 = function () {
              var currentPath = queue.pop();
              var lastNode = currentPath.nodes[currentPath.nodes.length - 1];
              // Extend search path outward to the next set of connections, creating X new paths.
              Object.keys(lastNode.to).forEach(function (id) {
                  var currentNode = _this.getNode(id);
                  // Reject loops.
                  if (currentNode && !currentPath.nodes.find(function (n) { return n.id === currentNode.id; })) {
                      var branchWeight = currentPath.weight + costForSegment(lastNode, currentNode);
                      // Test branch fitness.
                      if (branchWeight <= (bestWeights[currentNode.id] || branchWeight)) {
                          bestWeights[currentNode.id] = branchWeight;
                          var branchEstimate = branchWeight + (currentNode !== goalNode ? costEstimateToGoal(currentNode, goalNode) : 0);
                          // Test for viable path to goal.
                          if (bestPath == null || branchEstimate <= bestPath.weight) {
                              // Create a new branch path extended to search node.
                              var branchPath = currentPath.copy(branchWeight, branchEstimate);
                              branchPath.nodes.push(currentNode);
                              // Test if goal has been reached.
                              if (currentNode.id === goalNode.id) {
                                  // Retain best completed path.
                                  bestPath = bestPath ? bestCandidatePath(bestPath, branchPath) : branchPath;
                              }
                              else {
                                  // Queue additional search path.
                                  queue.push(branchPath);
                              }
                          }
                      }
                  }
              });
              // Sort queue by estimate to complete, highest to lowest.
              queue.sort(function (a, b) { return b.estimate - a.estimate; });
          };
          // While the queue contains paths:
          while (queue.length > 0) {
              _loop_1();
          }
          return bestPath !== null && bestPath !== void 0 ? bestPath : null;
      };
      // Snaps the provided point to the nearest position within the node grid.
      // @param pt  The point to snap into the grid.
      Grid.prototype.snapPointToGrid = function (pt) {
          var _this = this;
          var p = null;
          var a = null;
          var b = null;
          var bestDistance = Infinity;
          var tested = Object.create(null);
          Object.values(this.nodes).forEach(function (node) {
              Object.keys(node.to).forEach(function (relId) {
                  if (!tested[relId + " " + node.id]) {
                      tested[node.id + " " + relId] = true;
                      var rel = _this.getNode(relId);
                      var snapped = snapPointToLineSegment(pt, node, rel);
                      var offset = Point.distance(pt, snapped);
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
              p: p !== null && p !== void 0 ? p : pt,
              a: a,
              b: b,
          };
      };
      // Finds the nearest node to the specified node.
      // @param origin: The origin node to search from.
      // @return: The nearest other grid node to the specified target.
      Grid.prototype.nearestNodeToNode = function (id) {
          var node = this.getNode(id);
          var candidates = Object.values(this.nodes).filter(function (n) { return n.id !== id; });
          return node && candidates.length ? nearestPointToPoint(node, candidates) : null;
      };
      // Finds the nearest node to a specified point within the grid.
      // @param pt: Point to test.
      // @return: Nearest Node to target Point.
      Grid.prototype.nearestNodeToPoint = function (pt) {
          return nearestPointToPoint(pt, Object.values(this.nodes));
      };
      // Tests a Point for intersections with all Cells in the grid, and returns their ids.
      // @param pt  The point to snap into the grid.
      // @return  Array of Cell ids that hit the specified Point.
      Grid.prototype.cellsContainingPoint = function (pt) {
          var _this = this;
          return Object.values(this.cells).reduce(function (acc, cell) {
              var ring = cell.rels.map(function (id) { return _this.getNode(id); });
              if (boundingRectForPoints(ring).hitTest(pt) && hitTestPointRing(pt, ring)) {
                  acc.push(cell);
              }
              return acc;
          }, []);
      };
      // Tests a Cell for intersections with all nodes in the grid, and returns their ids.
      // @param id  The polygon id to test.
      // @return  Array of node ids that fall within the specified Cell.
      Grid.prototype.nodesInCell = function (id) {
          var _this = this;
          var nodes = [];
          var cell = this.getCell(id);
          if (cell) {
              var ring_1 = cell.rels.map(function (id) { return _this.getNode(id); });
              var rect_1 = boundingRectForPoints(ring_1);
              Object.values(this.nodes).forEach(function (node) {
                  // Run incrementally costly tests:
                  // - node in cell ring?
                  // - OR...
                  // node in rect AND node within ring?
                  if (cell.rels.includes(node.id) || (rect_1.hitTest(node) && hitTestPointRing(node, ring_1))) {
                      nodes.push(node);
                  }
              });
          }
          return nodes;
      };
      // Tests a Rect for intersections with all nodes in the grid, and returns their ids.
      // @param id  The polygon id to test.
      // @return  Array of node ids that fall within the specified Rect.
      Grid.prototype.nodesInRect = function (rect) {
          return Object.values(this.nodes).reduce(function (acc, node) {
              if (rect.hitTest(node)) {
                  acc.push(node);
              }
              return acc;
          }, []);
      };
      return Grid;
  }());

  exports.Cell = Cell;
  exports.ExtendedGrid = ExtendedGrid;
  exports.Grid = Grid;
  exports.Node = Node;
  exports.Path = Path;
  exports.Point = Point;
  exports.Rect = Rect;
  exports.angleDegrees = angleDegrees;
  exports.angleRadians = angleRadians;
  exports.angleSector = angleSector;
  exports.boundingRectForPoints = boundingRectForPoints;
  exports.ccw = ccw;
  exports.compositeId = compositeId;
  exports.cross = cross;
  exports.degreesToRadians = degreesToRadians;
  exports.hitTestPointRing = hitTestPointRing;
  exports.intersect = intersect;
  exports.nearestPointToPoint = nearestPointToPoint;
  exports.radiansToDegrees = radiansToDegrees;
  exports.snapPointToLineSegment = snapPointToLineSegment;
  exports.uuidv4 = uuidv4;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
