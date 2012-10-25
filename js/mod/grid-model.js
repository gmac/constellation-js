/**
* Grid Model.
* Main application model for managing node and polygon data.
*/
define([
	'lib/backbone',
	'lib/underscore',
	'lib/constellation',
	'mod/service-data'
],
function( Backbone, _, constellation, dataService ) {
	
	function GridModel() {
		this.nodes = {};
		this.polys = {};
	}
	GridModel.prototype = {
		name: 'untitled',
		icount: 0,
		nodes: null,
		polys: null,
		width: '',
		height: '',
		background: ''
	};
	
	var _data;
	
	var Grid = Backbone.Model.extend({
		UPDATE: 'update',
		CHANGE: 'change',
		NODE: 'n',
		POLY: 'p',
		
		// Initializes the grid model (native Backbone behavior).
		initialize: function() {
			this.resetData();
		},
		
		// Loads new grid data into the model.
		getLayoutsList: function() {
			dataService.getLayoutsList();
		},
		
		// Loads new grid data into the model.
		loadLayout: function( name ) {
			dataService.loadLayout( name );
		},
		
		// Loads new grid data into the model.
		saveLayout: function( name ) {
			dataService.saveLayout( name, _data );
		},
		
		// Loads new grid data into the model.
		deleteLayout: function( name ) {
			dataService.deleteLayout( name );
		},
		
		// Resets grid data to blank state.
		resetData: function() {
			this.setData( new GridModel() );
		},
		
		// Loads new grid data into the model.
		setData: function( data ) {
			this.attributes = _data = data;
			this.update();
		},
		
		getNodes: function() {
			return _data.nodes;
		},
		
		getPolys: function() {
			return _data.polys;
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addNode: function( x, y, silent ) {
			var node = new constellation.Node( this.NODE+ _data.icount++, x, y );
			_data.nodes[ node.id ] = node;
			this.update(true, silent);
			return node.id;
		},
		
		// Gets a single node by id reference.
		getNodeById: function( id ) {
			if ( _data.nodes.hasOwnProperty(id) ) {
				return _data.nodes[id];
			}
			return null;
		},
		
		// Counts the number of nodes defined within the grid.
		getNumNodes: function() {
			return _.size( _data.nodes );
		},
		
		// Tests if a collection of node ids are all defined.
		hasNodes: function( group ) {
			return _.all(group, function(id) {
				return _data.nodes.hasOwnProperty( id );
			});
		},
		
		// Joins nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		joinNodes: function( group, silent ) {
			var change = false,
				node,
				id,
				i;
			
			// Group must contain two or more nodes to join...
			if ( group.length > 1 && this.hasNodes(group) ) {
				
				// Loop through selection group of nodes...
				_.each(group, function(id) {
					node = _data.nodes[id];
					
					for (i = 0; i < group.length; i++) {
						id = group[i];
						if (id !== node.id) {
							node.to[ id ] = 1;
							change = true;
						}
					}
				});
			}
			
			this.update(change, silent);
			return change;
		},
		
		// Splits apart nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		splitNodes: function( group, silent ) {
			var change = false,
				node;
			
			// Alias 'detach' method for a single node reference.
			if (group.length < 2) {
				this.detachNodes( group );
				return;
			}

			// Decouple group node references.
			_.each(group, function(id) {
				node = _data.nodes[id];
				
				if (node && node.to) {
					for ( id in node.to ) {
						if ( _.contains(group, id) ) {
							delete node.to[ id ];
							change = true;
						}
					}
				}
			});

			this.update(change, silent);
			return change;
		},
		
		// Detachs a node from the grid.
		// Each node's connections will be severed from all joining nodes.
		detachNodes: function( group, silent ) {
			var change = false,
				local,
				foreign,
				i;
			
			_.each(group, function(id) {
				local = _data.nodes[id];
				
				if ( local && local.to ) {
					// Break all connections between target and its neighbors.
					for ( i in local.to ) {
						// Delete local reference.
						delete local.to[i];
					
						// Find foreign node.
						foreign = _data.nodes[i];
					
						// Delete foreign key relationship.
						if ( foreign && foreign.to ) {
							delete foreign.to[ id ];
						}
					}
					change = true;
				}
			});
			
			this.update(change, silent);
			return change;
		},
		
		// Detaches and removes a collection of nodes from the grid.
		removeNodes: function( group, silent ) {
			var change = false,
				poly,
				nodes,
				i;
			
			// detach all nodes from the grid without triggering an update.
			change = this.detachNodes( group, true );
			
			_.each(group, function(id) {
				if ( _data.nodes.hasOwnProperty(id) ) {
					// Detach and remove the node.
					delete _data.nodes[id];
					
					// Remove any dependent polygons.
					for (j in _data.polys) {
						poly = _data.polys[j];

						if ( poly && _.contains( poly.nodes, id ) ) {
							delete _data.polys[j];
						}
					}
					change = true;
				}
			});
			
			this.update(change, silent);
			return change;
		},
		
		// Adds a polygon to the grid, formed by a collection of node ids.
		addPolygon: function( group, silent ) {
			var poly;
			
			if ( group.length >= 3 && this.hasNodes(group) ) {
				poly = new constellation.Polygon( this.POLY+ _data.icount++, group );
				_data.polys[ poly.id ] = poly;
				this.update(true, silent);
				return poly.id;
			}
			return null;
		},
		
		// Gets a polygon model by id reference.
		getPolygonById: function( id ) {
			if ( _data.polys.hasOwnProperty(id) ) {
				return _data.polys[ id ];
			}
			return null;
		},
		
		// Counts the number of polygons defined in the grid.
		getNumPolygons: function() {
			return _.size( _data.polys );
		},
		
		// Removes a collection of polygons from the grid.
		removePolygons: function( group, silent ) {
			var change = false;
			
			_.each(group, function(id) {
				if ( _data.polys.hasOwnProperty(id) ) {
					delete _data.polys[ id ];
					change = true;
				}
			});
			
			this.update(change, silent);
			return change;
		},
		
		// Triggers update event for view refresh.
		update: function( change, silent ) {
			if ( (change || change === undefined) && !silent ) {
				this.trigger( this.UPDATE );
			}
		}
	});
	
	return new Grid();
});