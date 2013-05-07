#Constellation.js

Constellation manages 2D point grids and path navigation. The library is designed to control dynamic sprite motion. Constellation expands upon the motion system used in the [What Makes You Tick?](http://lassiegames.com/games/wmyt "What Makes You Tick?") adventure game series. Features include:

 - Point and polygon grid management.
 - Pathfinding with A-star.
 - Polygon hit testing with ray-scan.
 - Snapping points to line segments.
 - Optimized nearest point searching.

## Const

Constellation root scope provides basic geometry operations and geometric primitives. All of these methods may be called directly on the `Const` namespace, and are passed simple arrays and/or Constellation primitives (Point & Rect).

**Const.Point** `var point = new Const.Point( x, y );`  
Constellation point primitive. Const.Point objects have the following properties:

- `x`: horizontal coordinate of the point.
- `y`: vertical coordinate of the point.

**Const.Rect** `var rect = new Const.Rect( x, y, width, height );`  
Constellation rectangle primitive. Const.Rect objects have the following properties:

- `x`: horizontal coordinate of the rectangle origin.
- `y`: vertical coordinate of the rectangle origin.
- `width`: rectangle width.
- `height`: rectangle height.

**Const.distance** `var result = Const.distance( point1, point2 );`  
Calculates the distance between two provided Const.Point objects.

**Const.ccw** `var result = Const.ccw( point1, point2, point3, exclusive? );`  
Tests for counter-clockwise winding among three Const.Point objects. Returns true if the three points trend in a counter-clockwise arc. Useful for intersection tests. Passing `true` for the optional `exclusive` param will pass balanced arcs.

**Const.intersect** `var result = Const.intersect( pointA, pointB, pointC, pointD );`  
Tests for intersection between line segments AB and CD. Returns true if the line segments intersect.

**Const.getRectForPointRing** `var result = Const.getRectForPointRing( [points] );`  
Takes an array of Const.Point objects; returns a Const.Rect object of their bounding box.

**Const.hitTestRect** `var result = Const.getRectForPointRing( pointP, rect );`  
Takes a target point P and a rectangle object; returns true if the point falls within the rectangle.

**Const.hitTestPointRing** `var result = Const.hitTestPointRing( pointP, [points] );`  
Takes a target point P and an array of points defining a ring. Returns true if P falls within the ring of points. Hit test is performed using the ray-casting method.

**Const.snapPointToLineSegment** `var result = Const.snapPointToLineSegment( pointP, pointA, pointB );`  
Takes a target point P, and snaps it to the nearest point along line segment AB.

**Const.getNearestPointToPoint** `var result = Const.getNearestPointToPoint( pointP, [points] );`  
Takes a target point P, and an array of points to search. Returns the nearest point to P within the point collection.

## Const.Grid

Constellation Grid must be instanced.

**Const.Grid** `var grid = new Const.Grid( data? );`  
Constructor for a new Constellation grid. All grid operations must be invoked on an instance.

**Grid.Node** `use... grid.addNode();`  
Constellation grid `Node` object; use a `Grid` instance to create and manage nodes. Grid nodes have the following properties:

- `id`: unique identifier for the node. Don't touch this.
- `x`: horizontal coordinate of the node.
- `y`: vertical coordinate of the node.
- `to`: Table of connections to other nodes. Seriously, don't touch this.
- `data`: A data object of user-defined data attached to the node.

**Grid.Polygon** `use... grid.addPolygon();`  
Constellation grid `Polygon` object; use a `Grid` instance to create and manage polygons. Grid polygons have the following properties:

- `id`: unique identifier for the node. Don't touch this.
- `nodes`: Array of node ids defining the polygon ring.
- `data`: A data object of user-defined data attached to the polygon.

**grid.addNode** `grid.addNode( x, y, {data}? );` or `grid.addNode( {data}? );`  
Adds a new `Node` object with specified X and Y coordinates, and an optional data object. Returns a reference to the new `Node` object. A data object may be provided as the sole parameter, if the data object contains an `id` property, that id will be assigned to the new node.

**grid.getNodeById** `grid.getNodeById( id );`  
Gets a node by id reference. Returns a `Node` object, or `null` for missing ids.

**grid.getNodes** `grid.getNodes( id, ... );` or `grid.getNodes( [id, ...] );`  
Gets one or more grid nodes by id reference, or maps an array of grid nodes to an array of ids. Returns an array of `Node` objects. Invalid ids return as `null`.

**grid.getNumNodes** `grid.getNumNodes();`  
Specifies the number of nodes in the grid.

**grid.hasNodes** `grid.hasNodes( id, ... );` or `grid.hasNodes( [id, ...] );`  
Tests if one or more node ids, or an array of node ids, exists within the grid.

**grid.joinNodes** `grid.joinNodes( id1, id2, ... );` or `grid.joinNodes( [id1, id2, ...] );`  
Takes two or more node ids, or an array with two or more node ids, and joins them with connections. Returns `true` if changes are made.

**grid.splitNodes** `grid.splitNodes( id1, id2, ... );` or `grid.splitNodes( [id1, id2, ...] );`  
Takes two or more node ids, or an array with two or more node ids, and splits apart their common connections. Returns `true` if changes are made.

**grid.detachNodes** `grid.detachNodes( id, ... );` or `grid.detachNodes( [id, ...] );`  
Takes one or more node ids, or an array of node ids, and splits them from all of their respective connections. Returns `true` if changes are made.

**grid.removeNodes** `grid.removeNodes( id, ... );` or `grid.removeNodes( [id, ...] );`  
Takes one or more node ids, or an array of node ids, detaches them from all connections, then removes them each from the grid. Any dependent polygons are also removed. Returns `true` if changes are made.

**grid.addPolygon** `grid.addPolygon( [node ids], data? );`  
Takes an array of three or more node ids and creates a new `Polygon` object with the optional data object attached. Returns a reference to the new `Polygon` object.

**grid.getPolygonById** `grid.getPolygonById( id );`  
Gets a polygon by id reference. Returns a `Polygon` object, or `null` for missing ids.

**grid.getPolygons** `grid.getPolygons( id, ... );` or `grid.getPolygons( [id, ...] );`  
Gets one or more polygons by id reference, or maps an array of polygons to an array of ids. Returns an array of `Polygon` objects. Invalid ids return as `null`.

**grid.getNodesForPolygon** `grid.getNodesForPolygon( id );`  
Takes a polygon id and returns an array of `Node` objects defining its polygon ring. Returns `null` if the specified polygon id is undefined.

**grid.getNumPolygons** `grid.getNumPolygons();`  
Specifies the number of polygons in the grid.

**grid.removePolygons** `grid.removePolygons( id, ... );` or `grid.removePolygons( [id, ...] );`  
Takes an array of polygon ids and removes them from the grid. All nodes defining the polygon rings are left intact. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns `true` if changes are made.

**grid.findPath** `grid.findPath( startId, goalId, weightFunction?, estimateFunction? );`  
Takes two node ids defining start and goal nodes, then finds the shortest path between them. By default, routing favors the shortest path based on coordinate geometry. However, you may customize path routing using the optional weight and estimate functions:

 - `weightFunction`: `function( startNode, currentNode ) { return numericCost; }`  
This function is used to calculate the weight (or cost) of each new grid segment added to a path. The function is provided two Grid.Nodes as arguments, and expects a numeric segment weight to be returned. The pathfinder returns a path that accrues the lowest total weight. By default, `Const.distance` is used to measure the weight of each segment.

 - `estimateFunction`: `function( currentNode, goalNode ) { return numericEstimate; }`  
This function optimizes search performance by providing a best-case scenario estimate for each node's cost to reach the goal. This function is provided two Grid.Node objects as arguments: the current search node, and the goal node. An estimated cost-to-goal value should be returned. By default, `Const.distance` is used to estimate the best-case distance from a working path to the goal.

**grid.findPathWithFewestNodes** `grid.findPathWithFewestNodes( startId, goalId );`  
Convenience method for running `grid.findPath` configured to find a path to goal using the fewest node connections rather than the shortest distance.

**grid.snapPointToGrid** `grid.snapPointToGrid( point );`  
Snaps the provided point to the nearest position among all joined line segments within the node grid. The snapped point will be plotted at the nearest available line segment, or the nearest grid point if no line segments are defined. Returns a meta object with the following attributes:

 - `point`: the snapped `Point` object.
 - `offset`: the snapped offset distance from the original point.
 - `segment`: an array of node ids defining the line segment on which the point was snapped.

**grid.bridgePoints** `grid.bridgePoints( startPt, goalPt, confineToGrid? );`  
Creates a grid path bridging between two `Point` objects that are not connected to the grid. This is a composite operation intended to take two dynamic input locations, and intelligently connect them through the existing grid structure. The steps of this algorithm operate as follows:

 1. Test if start and goal are contained within a common polygon; if so, return a direction-connection array specifying: [start, goal].

 2. (...not yet implemented...) Test if points fall within adjacent polygons, and if they may be connected directly through the common side.

 3. Dynamically join start and goal points into the motion grid, then run pathfinder. Dynamic point inclusion works as follows:

  - If start or goal points fall within a polygon, then they'll be connected to their encompassing polygons' node rings.

  - Otherwise, start and goal points will create tether nodes that snap and join to the grid.

The `bridgePoints` method will always return an array of point objects starting with the originally specified `startPt`. The array will also contain additional path positions, and finally the `goalPt`. Optionally, you may specify `confineToGrid` as `true`, at which time the `goalPt` will be adjusted to either fall within a polygon area or snap to a grid line.

**grid.getNearestNodeToPoint** `grid.getNearestNodeToPoint( point );`  
Finds and returns the closest grid `Node` object to the specified `Point` position. Performs an optimized sorted search rather than brute-force distance comparisons.

**grid.getNearestNodeToNode** `grid.getNearestNodeToNode( id );`  
Finds the next closest grid node to the specified node id. Similar to `getNearestNodeToPoint`, except that the input is a node id rather than a point object.

**grid.hitTestPointInPolygons** `grid.hitTestPointInPolygons( point );`  
Returns `true` if the provided point intersects any `Polygon` objects within the grid.

**grid.getPolygonHitsForPoint** `grid.getPolygonHitsForPoint( point );`  
Tests a `Point` object for intersections with all `Polygon` objects in the grid, then returns an array of polygon ids that encompass the point.

**grid.getNodesInPolygon** `grid.getNodesInPolygon( id );`  
Takes a polygon id and tests it for intersections with all nodes in the grid, then returns an array of the contained node ids. Nodes that compose the polygon's ring will be included in the returned array, even though their edge positions may fail a mathematical hit test.

**grid.getNodesInRect** `grid.getNodesInRect( rect );`  
Tests a `Rect` object for intersections with all nodes in the grid, and returns an array of the contained node ids.

## Const.utils

Constellation includes implementations of several common collection management functions for working with arrays and objects. These are very similar to Underscore.js methods, although their implementations may vary.

**Const.utils.size** `Const.utils.size( object );`  
Counts the number of items in an array, or the number of properties on an object.

**Const.utils.contains** `Const.utils.contains( object, value );`  
Accepts an array or object and a value to search for. Returns true if an array contains the provided value, or an object defines a key for the specified value.

**Const.utils.each** `Const.utils.each( object, iteratorFunction, context? );`  
Iterates an array or object with the provided function. Iterator is passed `( value, index )` for arrays, and `( value, key )` for objects. An optional scope context may be provided in which to run the interator.

**Const.utils.map** `Const.utils.map( object, mutatorFunction, context? );`  
Iterates an array or object with the provided mutator function. Mutator is passed each `value`, and returns a modified value to replace the original within the collection. An optional scope context may be provided in which to run the interator.

**Const.utils.all** `Const.utils.all( array, testFunction, context? );`  
Iterates through the provided array and performs a test function on each value. Returns true if all values pass the test.
