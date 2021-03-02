const grid = new Geom2d.Grid();
const App = {
  data() {
    return {
      lastTouch: 0,
      marquee: null,
      points: [],
      selections: [],
      selectedNodes: {},
      selectedCells: {},
      grid,
    };
  },

  computed: {
    lines() {
      return Object.values(this.grid.nodes).reduce((acc, node) => {
        Object.keys(node.to).forEach(relId => {
          const rel = this.grid.getNode(relId);
          if (rel && !(`${rel.id} ${node.id}` in acc)) {
            acc[`${node.id} ${rel.id}`] = {
              ax: node.x,
              ay: node.y,
              bx: rel.x,
              by: rel.y,
            };
          }
        });
        return acc;
      }, {});
    },
    cells() {
      return Object.values(this.grid.cells).reduce((acc, cell) => {
        const draw = [];
        cell.rels.forEach((id, index) => {
          const node = this.grid.getNode(id);
          draw.push(index === 0 ? 'M' : 'L', node.x, ' ', node.y, ' ');
        });

        acc[cell.id] = draw.concat(['Z']).join('');
        return acc;
      }, {});
    }
  },

  methods: {
    nodeClass(id) {
      return this.selectedNodes[id] ? 'selected' : '';
    },

    cellClass(id) {
      return this.selectedCells[id] ? 'selected' : '';
    },

    joinNodes() {
      this.grid.joinNodes(Object.keys(this.selectedNodes));
    },

    splitNodes() {
      this.grid.splitNodes(Object.keys(this.selectedNodes));
    },

    addCell() {
      this.grid.addCell(Object.keys(this.selectedNodes));
    },

    isSelected(item) {
      return this.selectedNodes[item.id] || this.selectedCells[item.id];
    },

    select(itemOrItems, options={ reset: false }) {
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      const type = items[0] instanceof Geom2d.Cell ? Geom2d.Cell : Geom2d.Node;
      let selections = this.selections;

      if (options.reset || (this.selections.length && !(this.selections[0] instanceof type))) {
        selections = [];
      }

      this.selections = selections.concat(items);

      const nodeIds = {};
      const cellIds = {};
      this.selections.forEach(item => {
        if (item instanceof Geom2d.Node) {
          nodeIds[item.id] = true;
        } else if (item instanceof Geom2d.Cell) {
          cellIds[item.id] = true;
        }
      });

      this.selectedNodes = nodeIds;
      this.selectedCells = cellIds;
      return true;
    },

    deselect(item) {
      if (item instanceof Geom2d.Cell) {
        if (this.isSelected(item)) {
          this.selections = this.selections.filter(c => c !== item);
          delete this.selectedCells[item.id];
        }
      } else if (this.isSelected(item)) {
        this.selections = this.selections.filter(n => n !== item);
        delete this.selectedNodes[item.id];
      }
      return false;
    },

    toggle(item) {
      if (item instanceof Geom2d.Cell) {
        return this.selectedCells[item.id] ? this.deselect(item) : this.select(item);
      }
      return this.selectedNodes[item.id] ? this.deselect(item) : this.select(item);
    },

    // Manages a click-and-drag sequence behavior.
    // Injects a localized event offset into the behavior handlers.
    drag(onDrag, onDrop) {
      let dragged = false;
      function mouseUp(evt) {
        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('mousemove', mouseMove);
        onDrop && onDrop(evt.layerX, evt.layerY, dragged);
        return false;
      }
      function mouseMove(evt) {
        dragged = true;
        onDrag(evt.layerX, evt.layerY);
        return false;
      }
      document.addEventListener('mouseup', mouseUp);
      document.addEventListener('mousemove', mouseMove);
    },

    touch(evt) {
      var doubleClick = (evt.timeStamp - this.lastTouch < 250);
      this.lastTouch = evt.timeStamp;

      if (evt.target.tagName === 'circle') {
        this.touchNode(evt, doubleClick);
      } else if (evt.target.tagName === 'path') {
        this.touchCell(evt, doubleClick);
      } else {
        this.touchCanvas(evt, doubleClick);
      }
    },

    touchNode(evt, doubleClick) {
      const node = this.grid.getNode(evt.target.id);
      let addedToSelection = false;

      if (evt.shiftKey) {
        this.toggle(node);
        addedToSelection = true;
      } else if (!this.isSelected(node)) {
        this.select(node, { reset: true });
      }

      if (this.selectedNodes[node.id]) {
        const origin = new Geom2d.Point(evt.layerX, evt.layerY);
        const dragPoint = (x, y) => {
          Object.keys(this.selectedNodes).forEach(id => {
            const n = this.grid.getNode(id);
            n.x += (x - origin.x);
            n.y += (y - origin.y);
          });
          origin.x = x;
          origin.y = y;
        };

        this.drag(dragPoint, (x, y, dragged) => {
          if (!dragged && !addedToSelection) {
            this.selectedNodes = { [node.id]: true };
          }
        });
      }
    },

    touchCell(evt, doubleClick) {
      const cell = this.grid.getCell(evt.target.id);
      if (doubleClick) {
        this.select(cell.rels.map(id => this.grid.getNode(id)), { reset: true });
      } else if (evt.shiftKey) {
        this.toggle(cell);
      } else if (!this.isSelected(cell)) {
        this.select(cell, { reset: true });
      }

      if (this.isSelected(cell)) {
        const origin = new Geom2d.Point(evt.layerX, evt.layerY);
        this.drag((x, y) => {
          Object.keys(this.selectedCells).forEach(cid => {
            this.grid.getCell(cid).rels.forEach(nid => {
              const n = this.grid.getNode(nid);
              n.x += (x - origin.x);
              n.y += (y - origin.y);
            });
          });
          origin.x = x;
          origin.y = y;
        });
      }
    },

    touchCanvas(evt, doubleClick) {
      if (doubleClick) {
        this.grid.addNode(evt.layerX, evt.layerY);
      } else {
        if (!evt.shiftKey) {
          this.select([], { reset: true });
        }
        this.dragMarquee(evt);
      }
    },

    dragMarquee(evt) {
      const origin = new Geom2d.Point(evt.layerX, evt.layerY);
      const plotRect = (x, y) => {
        const minX = Math.min(origin.x, x);
        const minY = Math.min(origin.y, y);
        const maxX = Math.max(origin.x, x);
        const maxY = Math.max(origin.y, y);
        this.marquee = new Geom2d.Rect(minX, minY, maxX-minX, maxY-minY);
      };

      plotRect(origin.x, origin.y);
      this.drag(plotRect, (x, y) => {
        this.select(this.grid.nodesInRect(this.marquee));
        this.marquee = null;
      });
    }
  }
};

Vue.createApp(App).mount('#app')