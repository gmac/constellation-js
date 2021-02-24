var Cell = /** @class */ (function () {
    function Cell(id, rels, data) {
        this.id = id;
        this.rels = rels.slice();
        this.data = data;
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

var Point = /** @class */ (function () {
    function Point(x, y, data) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.data = data;
    }
    // Tests the distance between two points.
    Point.distance = function (a, b) {
        var x = b.x - a.x;
        var y = b.y - a.y;
        return Math.sqrt(x * x + y * y);
    };
    return Point;
}());

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
        }, {});
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
// Tests for counter-clockwise winding among three points.
// @param x: Point X of triangle XYZ.
// @param y: Point Y of triangle XYZ.
// @param z: Point Z of triangle XYZ.
// @param exclusive boolean: when true, equal points will be excluded from the test.
function ccw(x, y, z, exclusive) {
    if (exclusive === void 0) { exclusive = false; }
    return exclusive ?
        (z.y - x.y) * (y.x - x.x) > (y.y - x.y) * (z.x - x.x) :
        (z.y - x.y) * (y.x - x.x) >= (y.y - x.y) * (z.x - x.x);
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
    var circ = Math.PI * 2;
    sectors = sectors || 8;
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
function getRectForPointRing(points) {
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
    var origin = new Point(0, p.y);
    var hits = 0;
    // Test intersection of an external ray against each polygon side.
    points.forEach(function (_point, i) {
        var s1 = points[i];
        var s2 = points[(i + 1) % points.length];
        origin.x = Math.min(origin.x, Math.min(s1.x, s2.x) - 1);
        hits += (intersect(origin, p, s1, s2) ? 1 : 0);
    });
    // Return true if an odd number of hits were found.
    return hits % 2 > 0;
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
function getNearestPointToPoint(p, points) {
    var bestPt = null;
    var bestDist = Infinity;
    var i = points.length - 1;
    var a, dist;
    // Sort points by horizontal offset from P.
    points = points.sort(function (a, b) { return Math.abs(p.x - b.x) - Math.abs(p.x - a.x); });
    while (i >= 0) {
        a = points[i -= 1];
        if (Math.abs(p.x - a.x) < bestDist) {
            dist = Point.distance(p, a);
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

/** @class */ ((function () {
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
                _this.cells[c.id] = new Cell(c.id, c.rels, c.data);
            });
        }
    };
    Grid.prototype.addNode = function (x, y, data) {
        var node = new Node(uuidv4(), x, y, [], data);
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
    // Gets a collection of nodes by id references.
    Grid.prototype.getNodes = function (ids) {
        var _this = this;
        return ids.map(function (id) { return _this.getNode(id); });
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
                ids.forEach(function (refId) {
                    if (id !== refId) {
                        node.to[refId] = true;
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
        // Decouple group node references.
        ids.forEach(function (id) {
            var node = _this.getNode(id);
            if (node) {
                ids.forEach(function (refId) {
                    if (node.to[refId]) {
                        delete node.to[refId];
                        changed = true;
                    }
                });
            }
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
        if (rels.length >= 3 && this.hasNodes(rels)) {
            var cell = new Cell(uuidv4(), rels, data);
            this.cells[cell.id] = cell;
            return cell;
        }
        else {
            throw new Error('A cell requires three valid node references');
        }
    };
    // Gets a polygon by id reference.
    Grid.prototype.getCell = function (id) {
        return this.cells[id];
    };
    // Gets a collection of polygons by id references.
    Grid.prototype.getCells = function (ids) {
        var _this = this;
        return ids.map(function (id) { return _this.getCell(id); });
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
    Grid.prototype.findPath = function (_a) {
        var _this = this;
        var start = _a.start, goal = _a.goal, _c = _a.weightFunction, weightFunction = _c === void 0 ? Point.distance : _c, _d = _a.estimateFunction, estimateFunction = _d === void 0 ? Point.distance : _d, _e = _a.tiebreakerFunction, tiebreakerFunction = _e === void 0 ? function (a, _b) { return a; } : _e;
        var queue = []; // Queue of paths to search, sorted by estimated weight (highest to lowest).
        var bestWeights = {}; // Table of shortest weights found to each node id.
        var bestPath = undefined; // The best completed path found to goal.
        var searchPath; // A current path to be extended and searched.
        var searchNode; // A current node to extend outward and searched from.
        var branchPath; // A new path branch for the search queue.
        var branchWeight; // Current weight of a new branch being explored.
        var branchEstimate; // Estimated best-case weight of new branch reaching goal.
        var startNode = this.getNode(start);
        var goalNode = this.getNode(goal);
        // Create initial search path with default weight from/to self.
        queue.push(new Path([startNode], weightFunction(startNode, startNode)));
        // While the queue contains paths:
        while (queue.length > 0) {
            searchPath = queue.pop();
            startNode = searchPath.nodes[searchPath.nodes.length - 1];
            // Extend search path outward to the next set of connections, creating X new paths.
            Object.keys(startNode.to).forEach(function (id) {
                searchNode = _this.getNode(id);
                // Reject loops.
                if (searchNode && !searchPath.nodes.find(function (n) { return n.id === searchNode.id; })) {
                    branchWeight = searchPath.weight + weightFunction(startNode, searchNode);
                    // Test branch fitness.
                    if (branchWeight <= (bestWeights[searchNode.id] || branchWeight)) {
                        bestWeights[searchNode.id] = branchWeight;
                        branchEstimate = branchWeight + estimateFunction(searchNode, goalNode);
                        // Test for viable path to goal.
                        if (bestPath == null || branchEstimate <= bestPath.weight) {
                            // Create a new branch path extended to search node.
                            branchPath = searchPath.copy(branchWeight, branchEstimate);
                            branchPath.nodes.push(searchNode);
                            // Test if goal has been reached.
                            if (searchNode.id === goalNode.id) {
                                // Retain best completed path.
                                bestPath = bestPath ? tiebreakerFunction(bestPath, branchPath) : branchPath;
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
        }
        return bestPath || null;
    };
    return Grid;
})());

export { angleDegrees, angleRadians, angleSector, ccw, degreesToRadians, getNearestPointToPoint, getRectForPointRing, hitTestPointRing, intersect, radiansToDegrees, snapPointToLineSegment, uuidv4 };
