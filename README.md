#Constellation.js

A point-based grid layout and geometry search application.

This application explores geometry management for a 2D motion grid, inspired by the geometry system built for Lassie Adventure Studio. The Lassie engine never matured beyond a point grid with rectangle-based point trapping and free motion regions. Constellation intends to reproduce these features using a polygon-based grid. Current application features include:

 - Point and polygon grid creation.
 - Pathfinding using A-star.
 - Polygon hit test with ray scanning.
 - Point snapping for line segments.
 - Nearest-neighbor search.
 - Saved layouts via local storage.

## Const
Constellation root scope provides basic geometry operations and geometric primitives. All of these methods may be called directly on the `Const` namespace, and are passed simple arrays and/or Constellation primitives (Point & Rect).

**Const.Point** `var point = new Const.Point( x, y );`
Constellation point primitive. Const.Point objects have the following properties:

- x: X-coordinate of the point.
- y: Y-coordinate of the point.

**Const.Rect** `var rect = new Const.Rect( x, y, width, height );`
Constellation rectangle primitive. Const.Rect objects have the following properties:

- x: X-coordinate of the rectangle origin.
- y: Y-coordinate of the rectangle origin.
- width: rectangle width.
- height: rectangle height.

**Const.distance**

**Const.ccw**

**Const.intersect**

**Const.getRectForPointRing**

**Const.hitTestRect**

**Const.hitTestPointRing**

**Const.snapPointToLine**

**Const.getNearestPointToPoint**

## Const.Grid
Constellation Grid is a discrete component which must be instanced to use its API methods. After constructing a grid instance, all subsequent grid operations will be performed on the grid instance where they're invoked.

**Const.Grid** `var grid = new Const.Grid( nodes?, polygons? );`
Constructor for a new Constellation grid. All grid operations are run through an instance.

**Grid.Node** `use grid.addNode();`
Constellation grid Node object; use a Const.Grid to create and manage node instances. Grid nodes have the following properties:

- id: unique identifier for the node. Don't touch this.
- x: X-coordinate of the node.
- y: Y-coordinate of the node.
- to: Table of connections to other nodes. Seriously, don't touch this.
- data: A data object of user-defined data attached to the node.

**Grid.Polygon** `use grid.addPolygon();`
Constellation grid Polygon object; use a Const.Grid to create and manage polygon instances. Grid polygons have the following properties:

- id: unique identifier for the node. Don't touch this.
- nodes: Array of node ids defining the polygon ring.
- data: A data object of user-defined data attached to the polygon.

**addNode** `grid.addNode( x?, y?, data? );`
Adds a new Grid.Node object with specified X and Y coordinates, and an optional data object. Returns the new node id.

**getNodeById** `grid.getNodeById( id );`
Gets a single grid node by id reference. Returns the Grid.Node object, or null if undefined.

**getNodesForIds** `grid.getNodesForIds( [node id] );`
Takes an array of node ids, returns a mapped array of Grid.Node objects.

**getNumNodes** `grid.getNumNodes();`
Specifies the number of nodes in the grid.

**hasNode** `grid.hasNode( id );`
Tests if the specified node id exists within the grid.

**hasNodes** `grid.hasNodes( [node id] );`
Takes an array of node ids, returns true if all nodes are defined within the grid.

**joinNodes** `grid.joinNodes( [node ids], silent? );`
Takes an array of two or more node ids and joins them with connections. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns true if changes are made.

**splitNodes** `grid.splitNodes( [node ids], silent? );`
Takes an array of node ids and splits apart their common connections. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns true if changes are made.

**detachNodes** `grid.detachNodes( [node ids], silent? );`
Takes an array of node ids and splits them each from all their respective connections. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns true if changes are made.

**removeNodes** `grid.removeNodes( [node ids], silent? );`
Takes an array of node ids, detaches them from all connections, then removes them each from the grid. Any dependent polygons are also removed. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns true if changes are made.

**addPolygon** `grid.addPolygon( [node ids], data?, silent? );`
Takes an array of three or more node ids and creates a new Grid.Polygon object with the optional data object attached. Returns the new polygon id.

**getPolygonById** `grid.getPolygonById( id );`
Gets a single grid polygon by id reference. Returns the Grid.Polygon object, or null if undefined.

**getNodesForPolygon** `grid.getNodesForPolygon( id );`
Takes a polygon id and returns an array of Grid.Node objects defining the polygon ring. Returns null if the specified polygon id is undefined.

**getNumPolygons** `grid.getNumPolygons();`
Gets the number of polygons defined within the grid.

**removePolygons** `grid.removePolygons( [polygon ids], silent? );`
Takes an array of polygon ids and removes them from the grid. All nodes defining the polygon rings are left intact. Pass `true` as the optional second argument to perform changes silently without triggering an update event. Returns true if changes are made.

**update** `grid.update();`
Triggers an update event that may be handled by observers.

**findPath** `grid.findPath( startId, goalId, weightFunction?, estimateFunction? );`
Takes two node ids defining start and goal nodes, then finds the shortest path between them. By default, routing favors the shortest path based on coordinate geometry. However, you may customize path routing using the optional weight and estimate functions:

 - weightFunction: `function( startNode, currentNode ) { return numericCost; }` This function is used to calculate the weight (or cost) of each new grid segment added to a path. The function is provided two Grid.Nodes as arguments, and expects a numeric segment weight to be returned. The pathfinder returns a path that accrues the lowest total weight. By default, `Const.distance` is used to measure the weight of each segment.

 - estimateFunction: `function( currentNode, goalNode ) { return numericEstimate; }` This function optimizes search performance by providing a best-case scenario estimate for each node's cost to reach the goal. This function is provided two Grid.Node objects as arguments: the current search node, and the goal node. An estimated cost-to-goal value should be returned. By default, `Const.distance` is used to estimate the best-case distance to get a working path to the goal.

**findPathWithFewestNodes** `grid.findPathWithFewestNodes( startId, goalId );`
Convenience method for running `grid.findPath` configured to find a path to goal using the fewest node connections rather than the shortest distance.

## Const.utils

**keys**

**empty**

**size**

**each**

**map**

**contains**

**all**