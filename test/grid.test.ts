import Grid from '../src/grid';
import Node from '../src/gridNode';
import Cell from '../src/gridCell';
import Path from '../src/gridPath';

describe('Grid', () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid();
  });

  function numConnections(node: Node): number {
    return Object.keys(node.to).length;
  }

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
    it("finds a path between two joined nodes", function() {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(0, 100);
      grid.joinNodes([a.id, b.id]);

      const path = grid.findPath({ start: a.id, goal: b.id }) as Path;
      expect(path.nodes.length).toEqual(2);
      expect(path.nodes[0]).toEqual( a );
      expect(path.nodes[1]).toEqual( b );
    });

    it("finds a path between two nodes across a network of joined nodes", function() {
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

    it("fails to find a path between two nodes in unconnected grid fragments", function() {
      const a = grid.addNode(0, 0);
      const b = grid.addNode(0, 100);
      const c = grid.addNode(0, 200);
      grid.joinNodes([a.id, b.id]);

      const path = grid.findPath({ start: a.id, goal: c.id });
      expect(path).toBeNull();
    });

    it("finds the shortest path between two nodes by default, regardless of connection count", function() {
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

    it("allows custom grid searches using costing, estimating, and prioratizing functions", function() {
      const a = grid.addNode(0, 0, {weight: 2}).id;
      const b = grid.addNode(25, 0, {weight: 3}).id;
      const c = grid.addNode(75, 0, {weight: 3}).id;
      const d = grid.addNode(100, 0, {weight: 2}).id;
      const e = grid.addNode(50, 100, {weight: 2}).id;
      //const f = grid.addNode(50, 100, {weight: 2}).id;

      grid.joinNodes([a, b]);
      grid.joinNodes([b, c]);
      grid.joinNodes([c, d]);
      grid.joinNodes([a, e]);
      grid.joinNodes([e, d]);
      // grid.joinNodes([a, f]);
      // grid.joinNodes([f, d]);

      const path = grid.findPath({
        start: a,
        goal: d,
        costForSegment: (_prev, current) => current.data?.weight,
        costEstimateToGoal: (_current, goal) => goal.data?.weight,
        // bestCandidatePath: (a, b) => {
        //   console.log(a, b);
        //   if (a.nodes.find(n => n.id === e)) return a;
        //   if (b.nodes.find(n => n.id === e)) return b;
        //   return a;
        // },
      }) as Path;

      expect(path.weight).toEqual(6);
      expect(path.nodes.map(n => n.id)).toEqual([a, e, d]);
    });
  });
});
