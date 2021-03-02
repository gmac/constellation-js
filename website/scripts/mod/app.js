const cacheModel = (() => {
	// Grid Data
	// ---------
	// Stores data for an individual grid layout.
	var GridRecordModel = Backbone.Model.extend({
		defaults: {
			uid: 0,
			name: 'New Grid'
		}
	});

	// Cache
	// -----
	// Manages the collection of grid layout options.
	var CacheModel = Backbone.Collection.extend({

		model: GridRecordModel,
		localStorage: new Backbone.LocalStorage('constellation-index'),
		selectedModel: null,
		selectedIndex: -1,

		_uid: 0,

		initialize: function() {
			this.listenTo(this, 'sync', this.onSync);
		},

		onSync: function() {
			if (this.length) {
				this._uid = Math.max.apply(null, this.pluck('uid').concat([0]))+1;
				this.selectModelAt(0);
			} else {
				this.newRecord();
			}
		},

		// Creates a new record:
		newRecord: function() {
			this.create({uid:this._uid++});
			this.selectModelAt(this.length-1);
		},

		// Get / Set selected model index:
		selectModelAt: function( index ) {
			if (index !== this.selectedIndex && index >= 0 && index < this.length) {
				this.selectedIndex = index;
				this.selectedModel = this.at(index);
				this.trigger('select');
			}
			return this.selectedModel;
		}
	});

	return new CacheModel();
})();

const gridController = (() => {
	var GridController = Backbone.Model.extend({
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return selectionModel.type === 'n';
		},

		// Resets selection and then creates a new grid.
		newGrid: function() {
			selectionModel.deselectAll( true );
			gridModel.reset();
		},

		// Saves the current grid.
		saveGrid: function() {
			gridModel.save();
		},

		// Prints data out to the console.
		print: function() {
			if (typeof console !== 'undefined' && console.log) {
				console.log( JSON.stringify(gridModel.toJSON()) );
				this.alert("Grid data printed to your console");
			} else {
				this.alert("No console available");
			}
		},

		// Joins all nodes within the current selection group.
		joinNodes: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() > 1 ) {
				gridModel.joinNodes( selectionModel.items );
			} else {
				this.alert("Select two or more nodes", selectionModel.selectionSize());
			}
		},

		// Splits all nodes within the current selection group.
		splitNodes: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() > 1 ) {
				gridModel.splitNodes( selectionModel.items );
			} else {
				this.alert("Select two or more joined nodes", selectionModel.selectionSize());
			}
		},

		// Makes a polygon using the nodes in the current selection group.
		makePolygon: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() >= 3 ) {
				gridModel.addPolygon( selectionModel.items );
			} else {
				this.alert("Select three or more nodes", selectionModel.selectionSize());
			}
		},

		// Removes all selected geometry (may be nodes or polygons).
		deleteGeometry: function() {
			if ( !selectionModel.selectionSize() ) {
				this.alert("No selected geometry");
				return;
			}
			else if ( this.nodeOpsEnabled() ) {
				// NODES
				gridModel.removeNodes( selectionModel.items );
			} else {
				// POLYGONS
				gridModel.removePolygons( selectionModel.items );
			}
			selectionModel.deselectAll();
		},

		// Finds the shortest grid path between two selected nodes.
		findPath: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 2 ) {
				var result = gridModel.findPath( selectionModel.items[0], selectionModel.items[1] );

				if ( result.valid ) {
					selectionModel.selectPath( _.pluck(result.nodes, 'id') );
					this.alert("Shortest route of "+Math.round(result.weight)+"px");
				} else {
					this.alert("No valid routes");
				}
			} else {
				this.alert("Select two nodes", selectionModel.selectionSize());
			}
		},

		// Snaps a node onto the nearest grid line.
		snapNodeToGrid: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 1 ) {
				var node = gridModel.getNodeById( selectionModel.items[0] );
				var to = gridModel.snapPoint( node );

				if (!_.size(node.to)) {
					node.x = to.x;
					node.y = to.y;
					gridModel.update();
				} else {
					this.alert("Node must be unconnected");
				}

			} else {
				this.alert("Select a single node");
			}
		},

		// Finds and selects the nearest node to the current selection.
		selectNearestGridNode: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 1 ) {
				var nearest = gridModel.getNearestNodeToNode( selectionModel.items[0] );
				selectionModel.select( nearest.id );
			} else {
				this.alert("Select a single node");
			}
		},

		// Hit tests a node among all polygon definitions.
		hitTestGeometry: function() {
			if ( selectionModel.selectionSize() === 1 ) {
				var select;

				// Get new selection.
				if ( this.nodeOpsEnabled() ) {
					var node = gridModel.getNodeById( selectionModel.items[0] );
					select = gridModel.getPolygonHitsForPoint( node );
				} else {
					select = gridModel.getNodesInPolygon( selectionModel.items[0] );
				}

				if (select && select.length) {
					selectionModel.setSelection( select );
				} else {
					this.alert("No intersections");
				}

			} else {
				this.alert("Select a single node or polygon");
			}
		},

		alert: function(mssg, multiselect) {
			this.trigger( 'alert', mssg, multiselect );
		}
	});

	return new GridController();
})();

const gridModel = (() => {
	var updateMethods = [
		'addNode',
		'joinNodes',
		'splitNodes',
		'removeNodes',
		'addPolygon',
		'removePolygons',
		'reset'
	];

	var gridModel = _.extend(new Const.Grid(), Backbone.Events, {

		bg: '',

		init: function() {
			this.listenTo(this, 'change', this.save);

			var self = this;

			// Override all grid mutators with event-firing method wrappers:
			_.each(updateMethods, function(methodName) {
				self[ methodName ] = function() {
					Const.Grid.prototype[ methodName ].apply(self, arguments);
					self.update();
				};
			});

			return this;
		},

		setBackground: function(url) {
			this.bg = url;
			this.save();
			this.update();
		},

		// Loads current cache selection into the model:
		load: function() {
			var data = store.get('constellation');
			this.bg = (data && data.bg) || '';
			this.reset(data);
		},

		// Saves current model data into the cache:
		save: function(id) {
			var data = this.toJSON();
			data.bg = this.bg;
			store.set('constellation', data);
		},

		update: function() {
			this.trigger('change');
		}
	});

	return gridModel.init();
})();

const keyboardController = (() => {
	var _enabled = true;

	function stop(evt) {
		evt.preventDefault();
	}

	$(window)
		.on('keydown', function(evt) {
			if (_enabled) {
				switch ( evt.which ) {
					case 8: stop(evt); gridController.deleteGeometry(); return false; // "delete"
					case 66: stop(evt); gridController.splitNodes(); return false; // "b"
					case 67: stop(evt); gridController.print(); return false; // "c"
					case 74: stop(evt); gridController.joinNodes(); return false; // "j"
					case 80: stop(evt); gridController.makePolygon(); return false; // "p"
					case 70: stop(evt); gridController.findPath(); return false; // "f"
					case 83: stop(evt); gridController.snapNodeToGrid(); return false; // "s"
					case 78: stop(evt); evt.ctrlKey ? gridController.newGrid() : gridController.selectNearestGridNode(); return false; // "n"
					case 72: stop(evt); gridController.hitTestGeometry(); return false; // "h"
				}
			}
			//console.log(evt.which);
		});

	$('input')
		.on('focus', function(evt) {
			_enabled = false;
		})
		.on('blur', function(evt) {
			_enabled = true;
		});
})();