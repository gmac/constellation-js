/**
* Manages the selection state of grid geometry.
* Stores key tables of all selected elements.
*/
define([
	'lib/backbone'
],
function( Backbone ) {
	
	function NodeSelection( id, index ) {
		this.id = id;
		this.index = index;
	}
	
	var _numNodes = 0,
		_nodesById = {},
		_polys = {};
	
	var SelectionModel = Backbone.Model.extend({
		UPDATE: 'update',
		
		// Toggles the selection status of a node.
		toggleNode: function( id, shift ) {
			var selected = _nodesById.hasOwnProperty(id);
			
			if ( selected && shift ) {
				this.deselectNode( id );
				return false;
			} else if (!shift) {
				this.deselectAllNodes(true);
			}
			this.selectNode( id );
			return true;
		},
		
		// Selects a node by ID reference.
		selectNode: function( id ) {
			if ( !_nodesById.hasOwnProperty(id) ) {
				_nodesById[id] = new NodeSelection( id, _numNodes++ );
				this.update();
			}
		},
		
		// Deletes a node by ID reference.
		deselectNode: function( id ) {
			var removed = _nodesById[id],
				node,
				i;
				
			if ( removed ) {
				// Remove from nodes table.
				delete _nodesById[id];
				_numNodes--;
				
				// Remove from nodes array.
				for ( i in _nodesById ) {
					node = _nodesById[i];
					
					if ( node.index > removed.index ) {
						node.index -= 1;
					}
				}
				this.update();
			}
		},
		
		// Deselects all currently selected nodes.
		deselectAllNodes: function( silent ) {
			for (var i in _nodesById) {
				if ( _nodesById.hasOwnProperty(i) ) {
					delete _nodesById[i];
				}
			}
			_numNodes = 0;
		},
		
		// Gets the current node selection table.
		getNodeSelection: function() {
			return _nodesById;
		},
		
		// Selects a polygon by ID reference.
		selectPolygon: function( id ) {
			this.deselectAllNodes(true);
		},
		
		update: function() {
			this.trigger( this.UPDATE );
		}
	});
	
	return new SelectionModel();
});