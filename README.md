# Constellation.js

A geometry toolkit for controlling 2D sprite motion.

Constellation manages 2D point grids and pathfinding. The library is designed to control sprite motion within a 2D environment. Constellation expands upon the motion control system used in the [What Makes You Tick?](https://www.youtube.com/watch?v=qxngufqrZBE "What Makes You Tick?") adventure game series. Features include:

 - Point and cell grid management.
 - Point pathfinding with [A-star](http://en.wikipedia.org/wiki/A*_search_algorithm "A-star").
 - Cell hit tests with [ray casting](http://en.wikipedia.org/wiki/Point_in_polygon "Ray casting").
 - Snapping points to line segments.
 - Optimized nearest-point searching.

See the [grid builder](http://gmac.github.io/constellation-js "constellation-js") demo.

## Creating Animations

While Constellation is not an animation library itself, it's designed to work with animation tools. Use Constellation to manage and search grid geometry, then feed its point arrays into your preferred animation library.

# API Documentation

## Constellation.Point

```js
import { Point } from 'constellation';
const pt = new Point(100, 100);
```

**new Point(x, y)**

Builds a Point primitive with the following properties:

- `x`: horizontal coordinate of the point.
- `y`: vertical coordinate of the point.

**Point.distance** `var result = Point.distance(a, b);`

Calculates the distance between two provided `Point` objects.

## Constellation.Rect

```js
import { Rect } from 'constellation';
const rect = new Rect(10, 10, 100, 100);
```

**new Rect(x, y, width, height)**

Builds a Rect primitive with the following properties:

- `x`: horizontal coordinate of the rectangle origin.
- `y`: vertical coordinate of the rectangle origin.
- `width`: rectangle width.
- `height`: rectangle height.

## Constellation.Grid

```js
import { Grid } from 'constellation';
const grid = new Grid(data);
```

**new Grid(data?)**

Builds a new `Grid` instance with all of the following operations...

**grid.addNode(x, y, data?)**

Adds a new `Node` object with specified X and Y coordinates, and an optional data object. Returns a reference to the new `Node` object. A data object may be provided as the sole parameter; if the data object contains an `id` property, that id will be assigned to the new node.

**grid.getNode(id)**

Gets a node by id reference. Returns a `Node` object, or `null` for missing ids.

**grid.nodeCount**\

Specifies the number of nodes in the grid.

**grid.hasNodes([id, ...])**

Tests if all of the specified node ids exist in the grid.

**grid.joinNodes([id1, id2, ...])**

Joins an array of two or more node ids with connections. Returns `true` if changes are made.

**grid.splitNodes([id1, id2, ...])**

Breaks the connections among an array of two or more node ids. Returns `true` if changes are made.

**grid.detachNodes([id, ...])**

Splits an array of node ids from all of their respective connections. Returns `true` if changes are made.

**grid.removeNodes([id, ...])**

Detaches an array of node ids, then removes them each from the grid. Any dependent grid cells are also removed. Returns `true` if changes are made.

**grid.addCell([nodeId, ...], data?)**

Creates a new `Cell` from three or more node ids. Returns a reference to the new `Cell` object, or null if no cell was created.

**grid.getCell(id)**

Gets a cell by id reference. Returns a `Cell` object, or `null` for missing ids.

**grid.nodesForCell(id)**

Gets an array of `Node` objects defining the point ring for a cell id. Returns `null` for missing cells.

**grid.cellCount**

Specifies the number of cells in the grid.

**grid.removeCells([id, ...])**

Removes an array of cell ids from the grid. All nodes assocated with the cells are left unchanged. Returns `true` if changes are made.

**grid.findPath({ options })**

```ts
grid.findPath({
	start: string,
	goal: string,
	costForSegment?: (a: Node, b: Node) => number,
	costEstimateToGoal?: (a: Node, b: Node) => number,
	bestCandidatePath?: (a: Path, b: Path) => Path,
});
```

Takes `start` and `goal` node ids, then finds the shortest path between them. Routing favors the shortest path based on coordinate geometry by default. You may customize path routing using the optional weight and estimate functions:

 - `costForSegment`: used to calculate the weight (or cost) of each new grid segment added to a path. Receives two `Node` objects as arguments: the previous search node, and the current search node. Returns a numeric weight for each path segment. The pathfinder returns a path that accrues the lowest total weight; `Point.distance` is the default measure.

 - `costEstimateToGoal`: provides a best-case scenario estimate for each node's cost to reach the goal. Receives two `Node` objects as arguments: the current search node, and the goal node. Returns a numeric estimated cost-to-goal. The pathfinder prioritizes paths that estimate the lowest total weight; `Point.distance` is the default measure.

 - `bestCandidatePath`: once a path to goal is reached, subsequent paths discovered with _equal_ cost will use this tiebreaker to select which path to return. Favors the first discovered path by default.

**grid.snapPointToGrid( point )**

Snaps the provided point to the nearest position among all joined line segments within the node grid. The snapped point will be plotted at the nearest available line segment, or the nearest grid point if no line segments are defined. Returns a meta object with the following attributes:

 - `point`: the snapped `Point` object.
 - `offset`: the snapped offset distance from the original point.
 - `segment`: an array of node ids defining the line segment on which the point was snapped.

**grid.getNearestNodeToPoint** `grid.getNearestNodeToPoint( point );`

Finds and returns the closest grid `Node` object to the specified `Point` position. Performs an optimized (sorted) search.

**grid.getNearestNodeToNode** `grid.getNearestNodeToNode( id );`

Finds the next closest grid node to the specified node id. Similar to `getNearestNodeToPoint`, except that the input is a node id rather than a `Point` object.

**grid.hitTestPointInPolygons** `grid.hitTestPointInPolygons( point );`

Returns true if the provided `Point` intersects any `Polygon` objects within the grid.

**grid.getPolygonHitsForPoint** `grid.getPolygonHitsForPoint( point );`

Tests a `Point` object for intersections with all `Polygon` objects in the grid, then returns an array of polygon ids that encompass the point.

**grid.getNodesInPolygon** `grid.getNodesInPolygon( id );`

Takes a polygon id and tests it for intersections with all nodes in the grid, then returns an array of the contained node ids. Nodes that compose the polygon's ring will be included in the returned array, even though their edge positions may fail a mathematical hit test.

**grid.getNodesInRect** `grid.getNodesInRect( rect );`

Tests a `Rect` object for intersections with all nodes in the grid, and returns an array of the contained node ids.

## Constellation.Node

**Const.Node** use... `grid.addNode();`

Constellation grid `Node` object; use a `Grid` instance to create and manage nodes. Nodes are just `Point` objects with additional attributes, therefore they may be used directly with any Constellation method that performs `Point` operations. `Node` objects have the following properties:

- `id`: unique identifier for the node. Don't touch this.
- `x`: horizontal coordinate of the node.
- `y`: vertical coordinate of the node.
- `to`: Table of connections to other nodes. Seriously, don't touch this.
- `data`: A data object of user-defined data attached to the node.

## Constellation.Cell

**Cell** use... `grid.addCell();`

Constellation grid `Polygon` object; use a `Grid` instance to create and manage polygons. Grid polygons have the following properties:

- `id`: unique identifier for the node. Don't touch this.
- `nodes`: Array of node ids defining the polygon ring.
- `data`: A data object of user-defined data attached to the polygon.

Constellation `Grid` is a constructor function that must be instanced. A `Grid` object manages a collection of `Node` and `Polygon` objects.

## Constellation.Path

**Path** use... `grid.findPath();`

## Utilities

**ccw** `var result = Const.ccw( pointA, pointB, pointC, exclusive? );`

Tests for counter-clockwise winding among three `Point` objects. Returns true if the three points trend in a counter-clockwise arc. Useful for intersection tests. Passing `true` for the optional `exclusive` param will pass balanced arcs.

**intersect** `var result = Const.intersect( pointA, pointB, pointC, pointD );`

Tests for intersection between line segments AB and CD. Returns true if the line segments intersect.

**degreesToRadians** `var radians = Const.degreesToRadians( degrees );`

Utility method for converting [degrees](http://en.wikipedia.org/wiki/Degree_%28angle%29 "Degrees") to [radians](http://en.wikipedia.org/wiki/Radian "Radians").

**radiansToDegrees** `var degrees = Const.radiansToDegrees( radians );`

Utility method for converting [radians](http://en.wikipedia.org/wiki/Radian "Radians") to [degrees](http://en.wikipedia.org/wiki/Degree_%28angle%29 "Degrees").

**angleRadians** `var radians = Const.angleRadians( pointA, pointB );`

Calculates the angle (in radians) between line segment AB and the [positive X-origin axis](http://en.wikipedia.org/wiki/Origin_%28mathematics%29 "Origin axis"). Accepts two `Point` objects and returns the angle in [radians](http://en.wikipedia.org/wiki/Radian "Radians").

**angleDegrees** `var degrees = Const.angleDegrees( pointA, pointB );`

Calculates the angle (in degrees) between line segment AB and the [positive X-origin axis](http://en.wikipedia.org/wiki/Origin_%28mathematics%29 "Origin axis"). Accepts two `Point` objects and returns the angle in [degrees](http://en.wikipedia.org/wiki/Degree_%28angle%29 "Degrees").

**angleSector** `var degrees = Const.angleSector( radians, sectors?, offsetRadians? );`

Gets the [circular sector](http://en.wikipedia.org/wiki/Circular_sector "Circular Sector") index that an angle falls into. You may specify how many sectors to divide the circle into, and then plot an angle among those breaks. This is useful for applying orientation view states to a sprite while moving it around a grid; for example: given a sprite with 4 walk cycles for different orientations (left, front, right, back), use this method to select one of the four views based on the sprite's next angle of motion.

Requires an angle to be provided in radians. You may optionally specify the number of sectors to divide the circle into, the default is 8. Also accepts an optional offset (in radians) used to shift sector divisions off the [positive X-origin axis](http://en.wikipedia.org/wiki/Origin_%28mathematics%29 "Origin axis"). By default, offset is configured as one-half of the sector size, which centers the X-origin axis within the first sector. Returns an index between `0` and `x-1`, where x is the number of sectors.

**getRectForPointRing** `var result = Const.getRectForPointRing( [points] );`

Takes an array of `Point` objects; returns a `Rect` object of their bounding box.

**hitTestRect** `var result = Const.hitTestRect( pointP, rect );`

Takes target point P and a `Rect` object; returns `true` if the point falls within the rectangle.

**hitTestPointRing** `var result = Const.hitTestPointRing( pointP, [points, ...] );`

Takes a target point P and an array of points defining a ring. Returns true if P falls within the ring of points. Hit test is performed using [ray casting](http://en.wikipedia.org/wiki/Point_in_polygon "ray casting") method.

**snapPointToLineSegment** `var result = Const.snapPointToLineSegment( pointP, pointA, pointB );`

Takes target point P, and snaps it to the nearest point along line segment AB.

**getNearestPointToPoint** `var result = Const.getNearestPointToPoint( pointP, [points, ...] );`

Takes target point P and an array of points to search. Returns the nearest point to P within the array of points, using a simplified [nearest neighbor](http://en.wikipedia.org/wiki/Closest_pair_of_points_problem "Nearest neighbor") search.

# Data Graphs

While Constellation is designed to manage 2D coordinate geometry, it also provides support for managing node-based data graphs that can be searched using a-star. For example, let's set up a simple social graph using Constellation's node data API:

```js
import { Grid } from 'constellation';

// Create a social graph with "mom", "sister", "brother", and a "friend":
const grid = new Grid();
grid.addNode(0, 0, { id:'mom', age:50 });
grid.addNode(0, 0, { id:'sister', age:16 });
grid.addNode(0, 0, { id:'brother', age:14 });
grid.addNode(0, 0, { id:'friend', age:14 });

// Create two social rings:
grid.joinNodes('mom', 'sister', 'brother');
grid.joinNodes('mom', 'brother', 'friend');
```

The above defines a graph of data without real coordinates. This graph can be intelligently searched using the *costForSegment* and *costEstimateToGoal* pathfinder functions; for example, the following finds a path with the lowest age:

```js
var path = grid.findPath({
	start: 'sister',
	goal: 'friend',
	costForSegment: (last, current) => last.data.age + current.data.age,
	costEstimateToGoal: (current, goal) => goal.data.age,
});
// result array: ["sister" > "brother" > "friend"]
```
