import { Grid } from '../src/grid';
import { Node } from '../src/gridNode';
import {
  cross,
  //ccw,
  angleDegrees,
} from '../src/utils';

describe('Experiment', () => {
  // B ----- C \
  // |       |  E
  // A ----- D /
  // const grid = new Grid();
  // const a = grid.addNode(0, 0, { id: 'A' });
  // const b = grid.addNode(0, 10, { id: 'B' });
  // const c = grid.addNode(20, 10, { id: 'C' });
  // const d = grid.addNode(20, 0, { id: 'D' });
  // const e = grid.addNode(30, 5, { id: 'E' });

  // grid.joinNodes([a.id, b.id]);
  // grid.joinNodes([b.id, c.id]);
  // grid.joinNodes([c.id, d.id]);
  // grid.joinNodes([d.id, a.id]);
  // grid.joinNodes([c.id, e.id]);
  // grid.joinNodes([e.id, d.id]);

  // console.log(ccw(b, a, d));
  // console.log(ccw(d, a, b));
  // console.log(ccw(a, d, e));

  // console.log(angleDegrees(a, b)); // 90 (270)
  // console.log(angleDegrees(a, d)); // 0 (360)*

  // console.log(angleDegrees(d, c)); // 90 (270)
  // console.log(angleDegrees(d, e)); // 26 (334)*
  // console.log(angleDegrees(c, d)); // 270 (90)
  // console.log(angleDegrees(c, b)); // 180 (189)*

  const grid = new Grid({"nodes":[
    {"id":"0fa88487-c25d-4d8f-8d9c-0041c1bf298e","x":431,"y":253,"to":["0d75dea6-6f1b-4a66-903b-cb53a44b8c45","15d5ea2c-be3d-498a-ab8d-5cd2a36470a9","3dd9a5c4-26a2-4387-8e79-5a69f6395ccf"]},
    {"id":"15d5ea2c-be3d-498a-ab8d-5cd2a36470a9","x":490,"y":222,"to":["d4c569b9-48c2-43b1-961e-2fd46b6e4b6f","0d75dea6-6f1b-4a66-903b-cb53a44b8c45","0fa88487-c25d-4d8f-8d9c-0041c1bf298e","3dd9a5c4-26a2-4387-8e79-5a69f6395ccf","460a10d6-3fc9-4dbd-8fce-91a9817760b2"]},
    {"id":"d4c569b9-48c2-43b1-961e-2fd46b6e4b6f","x":552,"y":260,"to":["0d75dea6-6f1b-4a66-903b-cb53a44b8c45","15d5ea2c-be3d-498a-ab8d-5cd2a36470a9","460a10d6-3fc9-4dbd-8fce-91a9817760b2"]},
    {"id":"0d75dea6-6f1b-4a66-903b-cb53a44b8c45","x":479,"y":279,"to":["0fa88487-c25d-4d8f-8d9c-0041c1bf298e","d4c569b9-48c2-43b1-961e-2fd46b6e4b6f","15d5ea2c-be3d-498a-ab8d-5cd2a36470a9"]},
    {"id":"3dd9a5c4-26a2-4387-8e79-5a69f6395ccf","x":415,"y":175,"to":["0fa88487-c25d-4d8f-8d9c-0041c1bf298e","15d5ea2c-be3d-498a-ab8d-5cd2a36470a9"]},
    {"id":"460a10d6-3fc9-4dbd-8fce-91a9817760b2","x":575,"y":184,"to":["15d5ea2c-be3d-498a-ab8d-5cd2a36470a9","d4c569b9-48c2-43b1-961e-2fd46b6e4b6f"]}
  ],"cells":[]});

  function nextInContour(current: Node, previous?: Node): Node {
    let rels: Array<Node> = Object.keys(current.to).map(id => grid.getNode(id));

    if (previous) {
      rels = rels.filter(n => n !== previous);
    }

    if (previous && current.id === '15d5ea2c-be3d-498a-ab8d-5cd2a36470a9') {
      rels.forEach(n => {
        console.log(n.id, cross(previous, current, n));
      });
    }

    const sorted = rels
      .map(n => ({ node: n, angle: angleDegrees(current, n) }))
      .sort((a, b) => a.angle - b.angle);

    if (current.id === '15d5ea2c-be3d-498a-ab8d-5cd2a36470a9') {
      console.log(sorted);
    }

    return sorted[0].node;
  }

  function union(nodes: Array<Node>): Array<Node> {
    if (!nodes.length) return [];
    const start = nodes.sort((p, q) => p.y - q.y || p.x - q.x)[0];
    const ring: Array<Node> = [start];

    let previous = start;
    let current = nextInContour(start);

    while (current !== start) {
      ring.push(current);
      let next = nextInContour(current, previous);
      previous = current;
      current = next;
    }

    return ring;
  }

  it('passes', () => {
    console.log(union(Object.values(grid['nodes'])));
    expect(true).toEqual(true);
  });
});