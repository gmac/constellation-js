import { Grid } from '../src/grid';
import { Node } from '../src/gridNode';
import { Cell } from '../src/gridCell';
import { Path } from '../src/gridPath';
import { Rect } from '../src/rect';

describe('Grid', () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid();
  });

  function numConnections(node: Node): number {
    return Object.keys(node.to).length;
  }

  const sortNodes: (a: Node, b: Node) => number = (a, b) => a.id.localeCompare(b.id);

  describe('addNode', () => {
    it('adds a new node with specified X and Y coordinates, and returns it', () => {
      const x = 55, y = 71, id = grid.addNode(x, y).id;
      expect(id.length).toEqual(36);
      expect(grid.nodeCount).toEqual(1);
      expect(grid.getNode(id).x).toEqual(x);
      expect(grid.getNode(id).y).toEqual(y);
    });

    it('adds a new node without specified coordinates, which defaults to [0,0]', () => {
      const node = grid.addNode();
      expect(grid.nodeCount).toEqual(1);
      expect(node.x).toEqual(0);
      expect(node.y).toEqual(0);
    });
  });

  describe('getNode', () => {
    it('gets a single node by id reference.', () => {
      const node = grid.addNode();
      expect(grid.getNode(node.id)).toEqual(node);
    });
  });

  describe('hasNodes', () => {
    it('validates that multiple node ids are found', () => {
      const a = grid.addNode(), b = grid.addNode();
      expect(grid.hasNodes([a.id, b.id])).toBeTruthy();
    });

    it('indicates that some nodes are missing', () => {
      const a = grid.addNode();
      expect(grid.hasNodes([a.id, 'xyz'])).toBeFalsy();
    });
  });

  describe('joinNodes', () => {
    it('joins multiple node ids, provided as arguments', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 100);
      grid.joinNodes([a, b].map(n => n.id));

      expect(numConnections(a)).toEqual(1);
      expect(numConnections(b)).toEqual(1);
      expect(a.to[b.id]).toBeTruthy();
      expect(b.to[a.id]).toBeTruthy();
    });

    it('joins multiple node ids, creating connections between all references', () => {
      const nodes = [
        grid.addNode(0, 0),
        grid.addNode(100, 100),
        grid.addNode(100, 200),
      ];
      grid.joinNodes(nodes.map(n => n.id));

      nodes.forEach(n => {
        expect(numConnections(n)).toEqual(2);
      });
    });

    it('defers action when joining less than two nodes', () => {
      const node = grid.addNode();
      grid.joinNodes([node.id]);
      expect(numConnections(node)).toEqual(0);
    });

    it('defers action when joining a group with invalid node references', () => {
      const node = grid.addNode();
      grid.joinNodes([node.id, 'nope']);
      expect(numConnections(node)).toEqual(0);
    });
  });

  describe('splitNodes', () => {
    it('splits multiple connected node ids', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 100);
      const c = grid.addNode(100, 200);
      grid.joinNodes([a, b, c].map(n => n.id));
      grid.splitNodes([a, b].map(n => n.id));

      expect(numConnections(a)).toEqual(1);
      expect(numConnections(b)).toEqual(1);
      expect(numConnections(c)).toEqual(2);
      expect(a.to[c.id]).toBeTruthy();
      expect(c.to[a.id]).toBeTruthy();
    });

    it('defers action when splitting unconnected nodes', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 100);
      const c = grid.addNode(100, 200);

      grid.joinNodes([a, b].map(n => n.id));
      expect(numConnections(a)).toEqual(1);
      expect(numConnections(b)).toEqual(1);
      expect(numConnections(c)).toEqual(0);

      grid.splitNodes([a, c].map(n => n.id));
      expect(numConnections(a)).toEqual(1);
      expect(numConnections(b)).toEqual(1);
      expect(numConnections(c)).toEqual(0);
    });

    it('completely detaches a single node from all connections while splitting', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 100);
      const c = grid.addNode(100, 200);
      grid.joinNodes([a, b, c].map(n => n.id));
      grid.splitNodes([a.id]);
      expect(numConnections(a)).toEqual(0);
      expect(numConnections(b)).toEqual(1);
      expect(numConnections(c)).toEqual(1);
    });
  });

  describe('detachNodes', () => {
    it('detaches all connections from a group of node ids', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 100);
      const c = grid.addNode(100, 200);
      const d = grid.addNode(100, 200);
      grid.joinNodes([a, b, c, d].map(n => n.id));
      grid.detachNodes([a, b].map(n => n.id));

      expect(numConnections(a)).toEqual(0);
      expect(numConnections(b)).toEqual(0);
      expect(numConnections(c)).toEqual(1);
      expect(numConnections(d)).toEqual(1);
    });
  });

  describe('removeNode', () => {
    it('removes a group of node ids', () => {
      const a = grid.addNode();
      const b = grid.addNode();
      const c = grid.addNode();
      expect(grid.nodeCount).toEqual(3);

      grid.removeNodes([a, b].map(n => n.id));
      expect(grid.nodeCount).toEqual(1);
      expect(grid.getNode(c.id)).toBeDefined();
    });

    it('detaches connections while removing nodes', () => {
      const a = grid.addNode();
      const b = grid.addNode();
      const c = grid.addNode();
      const d = grid.addNode();
      expect(grid.nodeCount).toEqual(4);

      grid.joinNodes([a, b, c, d].map(n => n.id));
      grid.removeNodes([a, b].map(n => n.id));

      expect(grid.nodeCount).toEqual(2);
      expect(numConnections(c)).toEqual(1);
      expect(numConnections(d)).toEqual(1);
      expect(c.to[d.id]).toBeTruthy();
      expect(d.to[c.id]).toBeTruthy();
    });

    it('defers action when removing an invalid node reference', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      expect(grid.nodeCount).toEqual(2);

      grid.removeNodes([a, 'nope']);

      expect(grid.nodeCount).toEqual(1);
      expect(grid.getNode(b)).toBeDefined();
    });

    it('removes all dependent cells while removing a node', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      grid.addCell([a, b, c]);
      expect(grid.cellCount).toEqual(1);

      grid.removeNodes([a, b]);
      expect(grid.cellCount).toEqual(0);
    });
  });

  describe('addCell', () => {
    it('creates a cell from a group of nodes, and returns it', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      const x = grid.addCell([a, b, c]) as Cell;

      expect(grid.cellCount).toEqual(1);
      expect(x.rels).toEqual([a, b, c]);
    });

    it('returns an existing cell for duplicate node sets', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      const x = grid.addCell([a, b, c]) as Cell;
      const y = grid.addCell([b, c, a]) as Cell;

      expect(grid.cellCount).toEqual(1);
      expect(x.id).toEqual(y.id);
      expect(x).toEqual(y);
    });

    it('defers action when creating a cell with less than three nodes', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const x = grid.addCell([a, b]);

      expect(x).toBeNull();
      expect(grid.cellCount).toEqual(0);
    });

    it('defers action when creating a cell with an invalid node reference', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const x = grid.addCell([a, b, 'nope']);

      expect(x).toBeNull();
      expect(grid.cellCount).toEqual(0);
    });
  });

  describe('getCell', () => {
    it('gets a cell by id reference', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      const x = grid.addCell([a, b, c]) as Cell;

      expect(grid.getCell(x.id)).toEqual(x);
    });
  });

  describe('nodesForCell', () => {
    it('gets an array of nodes for a polygon reference', () => {
      const a = grid.addNode();
      const b = grid.addNode();
      const c = grid.addNode();
      const x = grid.addCell([a, b, c].map(n => n.id)) as Cell;
      const n = grid.nodesForCell(x.id);

      expect(n.length).toEqual(3);
      expect(n[0]).toEqual(a);
      expect(n[1]).toEqual(b);
      expect(n[2]).toEqual(c);
    });
  });

  describe('removeCells', () => {
    it('removes multiple valid cell ids', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      const d = grid.addNode().id;
      const x = grid.addCell([a, b, c]) as Cell;
      const y = grid.addCell([b, c, d]) as Cell;

      expect(grid.cellCount).toEqual(2);
      grid.removeCells([x.id, y.id]);
      expect(grid.cellCount).toEqual(0);
    });

    it('defers action when removing an invalid cell reference', () => {
      const a = grid.addNode().id;
      const b = grid.addNode().id;
      const c = grid.addNode().id;
      const d = grid.addNode().id;
      const x = grid.addCell([a, b, c]) as Cell;
      const y = grid.addCell([b, c, d]) as Cell;

      expect(grid.cellCount).toEqual(2);
      grid.removeCells([x.id, 'nope']);
      expect(grid.cellCount).toEqual(1);
      expect(grid.getCell(y.id)).toBeDefined();
    });
  });

  describe('findPath', () => {
    it('finds a path between two joined nodes', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(0, 100);
      grid.joinNodes([a.id, b.id]);

      const path = grid.findPath({ start: a.id, goal: b.id }) as Path;
      expect(path.nodes.length).toEqual(2);
      expect(path.nodes[0]).toEqual( a );
      expect(path.nodes[1]).toEqual( b );
    });

    it('finds a path between two nodes across a network of joined nodes', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(0, 100);
      const c = grid.addNode(0, 200);
      grid.joinNodes([a.id, b.id]);
      grid.joinNodes([b.id, c.id]);

      const path = grid.findPath({ start: a.id, goal: c.id }) as Path;
      expect(path.nodes.length).toEqual(3);
      expect(path.nodes[0]).toEqual(a);
      expect(path.nodes[1]).toEqual(b);
      expect(path.nodes[2]).toEqual(c);
    });

    it('fails to find a path between two nodes in unconnected grid fragments', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(0, 100);
      const c = grid.addNode(0, 200);
      grid.joinNodes([a.id, b.id]);

      const path = grid.findPath({ start: a.id, goal: c.id });
      expect(path).toBeNull();
    });

    it('finds the shortest path between two nodes by default, regardless of connection count', () => {
      var a = grid.addNode(0, 0).id;
      var b = grid.addNode(25, 0).id;
      var c = grid.addNode(75, 0).id;
      var d = grid.addNode(100, 0).id;
      var e = grid.addNode(50, 100).id;

      grid.joinNodes([a, b]);
      grid.joinNodes([b, c]);
      grid.joinNodes([c, d]);
      grid.joinNodes([a, e]);
      grid.joinNodes([e, d]);

      const path = grid.findPath({ start: a, goal: d }) as Path;
      expect(path.weight).toEqual(100);
      expect(path.nodes.map(n => n.id)).toEqual([a, b, c, d]);
    });

    it('allows custom grid searches using costing and estimating functions', () => {
      const a = grid.addNode(0, 0, { weight: 2 }).id;
      const b = grid.addNode(25, 0, { weight: 3 }).id;
      const c = grid.addNode(75, 0, { weight: 3 }).id;
      const d = grid.addNode(100, 0, { weight: 2 }).id;
      const e = grid.addNode(50, 100, { weight: 2 }).id;

      grid.joinNodes([a, b]);
      grid.joinNodes([b, c]);
      grid.joinNodes([c, d]);
      grid.joinNodes([a, e]);
      grid.joinNodes([e, d]);

      const path = grid.findPath({
        start: a,
        goal: d,
        costForSegment: (_prev, current) => current.data?.weight,
        costEstimateToGoal: (_current, goal) => goal.data?.weight,
      }) as Path;

      expect(path.weight).toEqual(6);
      expect(path.nodes.map(n => n.id)).toEqual([a, e, d]);
    });

    it('allows custom grid searches using final priority function', () => {
      const a = grid.addNode(0, 0).id;
      const b = grid.addNode(50, 0).id;
      const c = grid.addNode(50, 100).id;
      const d = grid.addNode(100, 100).id;

      grid.joinNodes([a, b]);
      grid.joinNodes([a, c]);
      grid.joinNodes([b, d]);
      grid.joinNodes([c, d]);

      const viaB = grid.findPath({
        bestCandidatePath: (p, q) => p.nodes.find(n => n.id === b) ? p : q,
        start: a,
        goal: d,
      }) as Path;

      const viaC = grid.findPath({
        bestCandidatePath: (p, q) => p.nodes.find(n => n.id === c) ? p : q,
        start: a,
        goal: d,
      }) as Path;

      expect(viaB.nodes.map(n => n.id)).toEqual([a, b, d]);
      expect(viaC.nodes.map(n => n.id)).toEqual([a, c, d]);
    });
  });

  describe('snapPointToGrid', () => {
    it('returns a point snapped to the nearest grid line segment', () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 0);
      grid.joinNodes([a.id, b.id]);

      const segment = grid.snapPointToGrid({ x: 50, y: 20 });

      expect(segment.p.x).toEqual(50);
      expect(segment.p.y).toEqual(0);
      expect(segment.a).toEqual(a);
      expect(segment.b).toEqual(b);
    });

    it('defers action when snapping a point to a grid with no nodes', () => {
      const pt = { x: 50, y: 20 };
      const segment = grid.snapPointToGrid(pt);

      expect(segment.p.x).toEqual(pt.x);
      expect(segment.p.y).toEqual(pt.y);
      expect(segment.a).toBeNull();
      expect(segment.b).toBeNull();
    });

    it('defers action when snapping a point to a grid with no node connections', () => {
      grid.addNode();
      grid.addNode();

      const pt = { x: 50, y: 20 };
      const segment = grid.snapPointToGrid(pt);

      expect(segment.p.x).toEqual(pt.x);
      expect(segment.p.y).toEqual(pt.y);
      expect(segment.a).toBeNull();
      expect(segment.b).toBeNull();
    });
  });

  describe('nearestNodeToNode', () => {
    it('finds the nearest node to the specified origin node', () => {
      const a = grid.addNode(0, 0);
      const c = grid.addNode(10, 10);
      grid.addNode(100, 100);
      expect(grid.nearestNodeToNode(c.id)).toEqual(a);
    });

    it('returns null when an invalid origin node is referenced', () => {
      grid.addNode(0, 0);
      grid.addNode(100, 100);
      expect(grid.nearestNodeToNode('nope')).toBeNull();
    });

    it('returns null when there are no other nodes besides the origin', () => {
      const a = grid.addNode(0, 0);
      expect(grid.nearestNodeToNode(a.id)).toBeNull();
    });
  });

  describe('nearestNodeToPoint', () => {
    it('finds the nearest node to the provided point', () => {
      const a = grid.addNode(0, 0);
      grid.addNode(100, 0);
      expect(grid.nearestNodeToPoint({ x: 10, y: 0 })).toEqual(a);
    });

    it('returns null for an empty grid', () => {
      expect(grid.nearestNodeToPoint({ x: 10, y: 0 })).toBeNull();
    });
  });

  describe('cellsContainingPoint', () => {
    it('returns an array of all cells containing a point', () => {
      const a = grid.addNode(0, 0).id;
      const b = grid.addNode(100, 0).id;
      const c = grid.addNode(0, 100).id;
      const d = grid.addNode(100, 100).id;
      grid.addCell([a, b, c]);
      grid.addCell([a, c, d]);
      const hit1 = grid.cellsContainingPoint({ x: 5, y: 50 });
      const hit2 = grid.cellsContainingPoint({ x: 50, y: 5 });
      const hit3 = grid.cellsContainingPoint({ x: 95, y: 50 });

      expect(hit1.length).toEqual(2);
      expect(hit2.length).toEqual(1);
      expect(hit3.length).toEqual(0);
    });

    it('returns empty when there are no cells', () => {
      expect(grid.cellsContainingPoint({ x: 10, y: 10 })).toEqual([]);
    });
  });

  describe('nodesInCell', () => {
    it("returns an array of all node ids contained within a polygon", () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 0);
      const c = grid.addNode(0, 100);
      const d = grid.addNode(50, 25); // Inside figure ABC
      grid.addNode(200, 200); // Outside figure ABC
      const order: (a: Node, b: Node) => number = (a, b) => a.id.localeCompare(b.id);
      const cell = grid.addCell([a, b, c].map(n => n.id)) as Cell;
      const nodes = grid.nodesInCell(cell.id).sort(order);
      expect(nodes).toEqual([a, b, c, d].sort(order));
    });
  });

  describe('nodesInCell', () => {
    it("returns an array of all node ids contained within a polygon", () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 0);
      const c = grid.addNode(0, 100);
      const d = grid.addNode(50, 25); // Inside figure ABC
      grid.addNode(200, 200); // Outside figure ABC
      const cell = grid.addCell([a, b, c].map(n => n.id)) as Cell;
      const nodes = grid.nodesInCell(cell.id).sort(sortNodes);
      expect(nodes).toEqual([a, b, c, d].sort(sortNodes));
    });
  });

  describe('nodesInRect', () => {
    it("returns an array of all nodes contained within a rectangle", () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(50, 50);
      grid.addNode(100, 100);
      const nodes = grid.nodesInRect(new Rect(75, 75, -100, -100));

      expect(nodes.sort(sortNodes)).toEqual([a, b].sort(sortNodes));
    });
  });

  describe('getAdjacentCellSegments', () => {
    it("returns an array specifying an adjacent line segment", () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(100, 0);
      const c = grid.addNode(0, 100);
      const d = grid.addNode(100, 100);
      const c1 = grid.addCell([a, b, c].map(n => n.id)) as Cell;
      const c2 = grid.addCell([a, c, d].map(n => n.id)) as Cell;

      expect(grid.getAdjacentCellSegments(c1.id, c2.id)).toEqual([{ a: c, b: a }]);
    });

    it("finds all adjacent line segments in interlocking polygons", () => {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(50, 50);
      const c = grid.addNode(0, 100);
      const d = grid.addNode(100, 50);
      const c1 = grid.addCell([a, b, c].map(n => n.id)) as Cell;
      const c2 = grid.addCell([a, d, c, b].map(n => n.id)) as Cell;

      expect(grid.getAdjacentCellSegments(c1.id, c2.id)).toEqual([
        { a: a, b: b },
        { a: b, b: c },
      ]);
    });
  });
});
