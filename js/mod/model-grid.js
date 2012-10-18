define([
	'lib/backbone',
	'lib/underscore',
	'mod/service-data'
],
function( Backbone, _, dataService ) {
	
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
	
	function NodeModel(id, x, y, to) {
		this.id = id;
		this.x = x || 0;
		this.y = y || 0;
		this.to = (to || {});
	}
	
	function PolygonModel( id, nodes ) {
		this.id = id;
		this.nodes = nodes;
		this.sides = nodes.length;
	}
	
	var _data;
	
	var Grid = Backbone.Model.extend({
		RENDER: 'render',
		CHANGE: 'change',
		
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
			this.refresh();
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addNode: function( x, y ) {
			var node = new NodeModel('n'+ _data.icount++, x, y);
			_data.nodes[ node.id ] = node;
			this.refresh();
		},
		
		getNodeById: function( id ) {
			if ( _data.nodes.hasOwnProperty(id) ) {
				return _data.nodes[id];
			}
			return null;
		},
		
		// Joins nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		joinNodes: function( group ) {
			var node,
				i,
				j;
			
			// Group must contain two or more nodes to join...
			if ( _.size(group) > 1 ) {
				
				// Normalize an array of ids into an object hashtable.
				if ( group instanceof Array ) {
					group = _.object(group, group);
				}
				
				// Loop through selection group of nodes...
				for ( i in group ) {
					if ( group.hasOwnProperty(i) ) {
						node = _data.nodes[i];
						
						if (node && node.to) {
							// Add foreign keys from the selection group to each node.
							for ( j in group ) {
								if ( group.hasOwnProperty(j) && j !== node.id ) {
									node.to[ j ] = 1;
								}
							}
						}
					}
				}

				this.refresh();
			}
		},
		
		// Splits apart nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		splitNodes: function( group ) {
			var count = _.size(group),
				node,
				i,
				j;
			
			// Normalize an array of ids into an object hashtable.
			if ( group instanceof Array ) {
				group = _.object(group, group);
			}

			// Loop through all ids in the selection group.
			for ( i in group ) {
				if ( group.hasOwnProperty(i) && _data.nodes.hasOwnProperty(i) ) {
					node = _data.nodes[i];
				
					if ( count > 1 ) {
						
						// Loop through node connections and detach all references within the selection.
						for ( j in node.to ) {
							if ( node.to.hasOwnProperty(j) && group.hasOwnProperty(j) ) {
								delete node.to[j];
							}
						}

					} else {
						// Sever a single node from all connections,
						// and exit the function without calling refresh.
						return this.detachNode( node.id );
					}
				}
			}
			this.refresh();
		},
		
		// Detachs a node from the grid.
		// Target node's connections will be severed from all joining nodes.
		detachNode: function( id ) {
			var local = _data.nodes[id],
				foreign,
				i;
			
			if ( local && local.to ) {
				// Break all connections between target and its neighbors.
				for ( i in local.to ) {
					if ( local.to.hasOwnProperty(i) ) {
						// Delete local reference.
						delete local.to[i];
						
						// Find foreign node.
						foreign = _data.nodes[i];
						
						// Delete foreign key relationship.
						if (foreign && foreign.to && foreign.to.hasOwnProperty( id )) {
							delete foreign[ id ];
						}
					}
				}
				this.refresh();
			}
		},
		
		removeNode: function( id ) {
			if ( _data.nodes.hasOwnProperty(id) ) {
				this.detachNode( id );
				delete _data.nodes[i];
				this.refresh();
			}
		},
		
		addPolygon: function( nodeIds ) {
			var poly = new PolygonModel( 'p'+ _data.icount++, nodes );
			_data.polys[ poly.id ] = poly;
			this.refresh();
		},
		
		removePolygon: function( id ) {
			if ( _data.polys.hasOwnProperty(id) ) {
				delete _data.polys[ id ];
				this.refresh();
			}
		},
		
		refresh: function() {
			this.trigger( this.RENDER );
		},
		
		getData: function() {
			return _data;
		}
	});
	
	return window.grid = new Grid();
});