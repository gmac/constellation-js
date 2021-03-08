const { Grid } = require('./dist/index.js');
const grid = new Grid({"nodes":[{"id":"d14610f5-4140-405f-a6f7-342d1dcf412d","x":275,"y":158,"to":["8f9a8895-51ca-4120-b4e2-3befd1fcd5ed","cd9d6589-9ebd-4f2b-881e-0ba346aa3fd5"]},{"id":"8f9a8895-51ca-4120-b4e2-3befd1fcd5ed","x":277,"y":244,"to":["d14610f5-4140-405f-a6f7-342d1dcf412d","7f8e9b83-ebbc-4caf-9dd9-4a195e511784"]},{"id":"7f8e9b83-ebbc-4caf-9dd9-4a195e511784","x":486,"y":246,"to":["8f9a8895-51ca-4120-b4e2-3befd1fcd5ed","cd1eed07-1cab-4027-97c0-75be4d2898f1"]},{"id":"cd9d6589-9ebd-4f2b-881e-0ba346aa3fd5","x":484,"y":157,"to":["fbdef40d-8a71-474e-93f1-b008d848f112","d14610f5-4140-405f-a6f7-342d1dcf412d"]},{"id":"fbdef40d-8a71-474e-93f1-b008d848f112","x":484,"y":185,"to":["cd1eed07-1cab-4027-97c0-75be4d2898f1","d56ea8f3-0e2d-4016-bc24-ecace835ee41","f07ce3bb-195a-47e9-b9aa-67b9bfbba4fb","cd9d6589-9ebd-4f2b-881e-0ba346aa3fd5"]},{"id":"cd1eed07-1cab-4027-97c0-75be4d2898f1","x":485,"y":211,"to":["fbdef40d-8a71-474e-93f1-b008d848f112","d56ea8f3-0e2d-4016-bc24-ecace835ee41","b606a115-9c8c-4a7f-af19-547289331897","7f8e9b83-ebbc-4caf-9dd9-4a195e511784"]},{"id":"b606a115-9c8c-4a7f-af19-547289331897","x":534,"y":232,"to":["f07ce3bb-195a-47e9-b9aa-67b9bfbba4fb","cd1eed07-1cab-4027-97c0-75be4d2898f1"]},{"id":"f07ce3bb-195a-47e9-b9aa-67b9bfbba4fb","x":532,"y":171,"to":["b606a115-9c8c-4a7f-af19-547289331897","fbdef40d-8a71-474e-93f1-b008d848f112"]},{"id":"d56ea8f3-0e2d-4016-bc24-ecace835ee41","x":444,"y":195,"to":["fbdef40d-8a71-474e-93f1-b008d848f112","cd1eed07-1cab-4027-97c0-75be4d2898f1"]}],"cells":[]});

const start = grid.getNode('8f9a8895-51ca-4120-b4e2-3befd1fcd5ed');
const visited = { '8f9a8895-51ca-4120-b4e2-3befd1fcd5ed': true };
const union = [start];

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

// Test if point Z is left|on|right of an infinite 2D line.
// > 0 left, = 0 on, < 0 for right
export function winding(x: Point, y: Point, z: Point): number {
  return (z.y-x.y) * (y.x-x.x) - (y.y-x.y) * (z.x-x.x);
}


function nextNode(node) {
  Object.keys(node.to).forEach(relId => {
    if (!visited[relId]) {
      const rel = grid.getNode(relId);

      console.log(relId, dot(node, rel), cross(node, rel));
    }
  });
}

nextNode(start);

// Suppose your polygon is given in counter-clockwise order. Let P1=(x1,y1), P2=(x2,y2) and P3=(x3,y3) be consecutive vertices. You want to know if the angle at P2 is “concave” i.e. more than 180 degrees. Let V1=(x4,y4)=P2-P1 and V2=(x5,y5)=P3-P2. Compute the “cross product” V1 x V2 = (x4.y5-x5.y4). This is negative iff the angle is concave.

function dot_product(vector1, vector2) {
  var result = 0;
  for (var i = 0; i < 3; i++) {
    result += vector1[i] * vector2[i];
  }
  return result;
}
console.log(dot_product([1,2], [1,2]))
console.log(dot_product([2,4], [2,4]))
console.log(dot_product([1,1], [0,1]))

class Vector {
  constructor(...components) {
    this.components = components
  }
  // ...

  // 3D vectors only
  crossProduct({ components }) {
    return new Vector(
      this.components[1] * components[2] - this.components[2] * components[1],
      this.components[2] * components[0] - this.components[0] * components[2],
      this.components[0] * components[1] - this.components[1] * components[0]
    )
  }
}