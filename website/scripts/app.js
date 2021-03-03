const App = {
  data() {
    return {
      grid: new Geom2d.Grid(),
      lastTouch: 0,
      marquee: null,
      selections: [],
      selectionIds: {},
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
    },
    nodeSelection() {
      return this.selections[0] instanceof Geom2d.Node;
    },
    cellSelection() {
      return this.selections[0] instanceof Geom2d.Cell;
    }
  },

  methods: {
    joinNodes() {
      if (!this.nodeSelection) return;
      this.grid.joinNodes(Object.keys(this.selectionIds));
    },

    splitNodes() {
      if (!this.nodeSelection) return;
      this.grid.splitNodes(Object.keys(this.selectionIds));
    },

    addCell() {
      if (!this.nodeSelection) return;
      this.grid.addCell(Object.keys(this.selectionIds));
    },

    deleteGeometry() {
      if (!this.selections.length) {
        return this.alert("No selected geometry");
      } else if (this.nodeSelection) {
        this.grid.removeNodes(Object.keys(this.selectionIds));
      } else if (this.cellSelection) {
        this.grid.removeCells(Object.keys(this.selectionIds));
      }
      this.select([]);
    },

    hasSelection(id) {
      return this.selectionIds[id] || false;
    },

    isSelected(item) {
      return this.selectionIds[item.id] || false;
    },

    select(itemOrItems, options={ append: false }) {
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      let selections = options.append ? this.selections : [];

      if (selections.length && !(selections[0] instanceof items[0].constructor)) {
        selections = [];
      }

      this.selections = selections.concat(items);
      this.selectionIds = this.selections.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {});
      return true;
    },

    deselect(item) {
      this.selections = this.selections.filter(s => s !== item);
      delete this.selectionIds[item.id];
      return false;
    },

    toggle(item) {
      return this.isSelected(item) ? this.deselect(item) : this.select(item, { append: true });
    },

    // Manages a click-and-drag sequence behavior.
    // Injects a localized event offset into the behavior handlers.
    drag(onDrag, onDrop=() => null) {
      let dragged = false;
      function mouseUp(evt) {
        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('mousemove', mouseMove);
        onDrop(evt.layerX, evt.layerY, dragged);
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

      if (evt.shiftKey) {
        this.toggle(node);
      } else if (!this.isSelected(node)) {
        this.select(node);
      }

      if (this.isSelected(node)) {
        const origin = new Geom2d.Point(evt.layerX, evt.layerY);
        const dragPoint = (x, y) => {
          this.selections.forEach(n => {
            n.x += (x - origin.x);
            n.y += (y - origin.y);
          });
          origin.x = x;
          origin.y = y;
        };

        this.drag(dragPoint);
      }
    },

    touchCell(evt, doubleClick) {
      const cell = this.grid.getCell(evt.target.id);
      if (doubleClick) {
        this.select(cell.rels.map(id => this.grid.getNode(id)));
      } else if (evt.shiftKey) {
        this.toggle(cell);
      } else if (!this.isSelected(cell)) {
        this.select(cell);
      }

      if (this.isSelected(cell)) {
        const origin = new Geom2d.Point(evt.layerX, evt.layerY);
        this.drag((x, y) => {
          const uniqueNodes = this.selections.reduce((acc, cell) => {
            cell.rels.forEach(nid => {
              acc[nid] = acc[nid] || this.grid.getNode(nid);
            });
            return acc;
          }, {});

          Object.values(uniqueNodes).forEach(n => {
            n.x += (x - origin.x);
            n.y += (y - origin.y);
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
          this.select([]);
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
        this.select(this.grid.nodesInRect(this.marquee), { append: true });
        this.marquee = null;
      });
    }
  }
};

Vue.createApp(App).mount('#app');
