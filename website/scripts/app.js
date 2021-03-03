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
          if (rel && !acc[`${rel.id} ${node.id}`]) {
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
    ordinals() {
      return !this.nodeSelection ? [] : this.selections.map((n, i) => ({
        text: String(i + 1),
        x: n.x,
        y: n.y,
      }));
    },
    nodeSelection() {
      return this.selections[0] instanceof Geom2d.Node;
    },
    cellSelection() {
      return this.selections[0] instanceof Geom2d.Cell;
    }
  },

  methods: {
    save() {
      localStorage.setItem('constellation', JSON.stringify(this.grid.toConfig()));
    },

    load() {
      const data = localStorage.getItem('constellation');
      if (data) {
        this.grid.reset(JSON.parse(data));
      }
    },

    print() {
      console.log(JSON.stringify(this.grid.toConfig()));
    },

    joinNodes() {
      if (this.nodeSelection) {
        this.grid.joinNodes(Object.keys(this.selectionIds));
        this.save();
      }
    },

    splitNodes() {
      if (this.nodeSelection) {
        this.grid.splitNodes(Object.keys(this.selectionIds));
        this.save();
      }
    },

    addCell() {
      if (this.nodeSelection) {
        this.grid.addCell(Object.keys(this.selectionIds));
        this.save();
      }
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
    drag(onDrag, onDrop=() => null, save=true) {
      let dragged = false;
      const mouseUp = (evt) => {
        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('mousemove', mouseMove);
        onDrop(evt.layerX, evt.layerY, dragged);
        if (save) this.save();
        return false;
      };
      const mouseMove = (evt) => {
        dragged = true;
        onDrag(evt.layerX, evt.layerY);
        return false;
      };
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

      if (doubleClick) {
        this.select(node);
      } else if (evt.shiftKey) {
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
        this.save();
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
      }, false);
    }
  },

  mounted() {
    window.addEventListener('keydown', (evt) => {
      const handle = (fn) => {
        evt.preventDefault();
        fn();
        return false;
      };

      switch (evt.key.toUpperCase()) {
        case 'BACKSPACE': return handle(() => this.deleteGeometry());
        case 'B': return handle(() => this.splitNodes());
        case 'P': return handle(() => this.print());
        case 'J': return handle(() => this.joinNodes());
        case 'C': return handle(() => this.addCell());
        // case 70: return handle(() => this.findPath());
        // case 83: return handle(() => this.snapNodeToGrid());
        // case 78: return handle(() => evt.ctrlKey ? this.newGrid() : this.selectNearestGridNode());
        // case 72: return handle(() => this.hitTestGeometry());
      }
    });

    this.load();
  }
};

const Info = {
  data() {
    return {
      enabled: false,
    };
  },
};

Vue.createApp(App).mount('#app');
Vue.createApp(Info).mount('#info');
