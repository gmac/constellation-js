define([
	'lib/backbone'
],
function( Backbone ) {
	
	var _nodes = {};
	
	var SelectionModel = Backbone.Model.extend({
		UPDATE: 'update',
		toggleNode: function( id, shift ) {
			var selected = _nodes.hasOwnProperty(id);
			
			if ( selected && shift ) {
				this.deselectNode( id );
				return false;
			} else if (!shift) {
				this.clearNodes(false);
			}
			this.selectNode( id );
			return true;
		},
		selectNode: function( id ) {
			_nodes[id] = 1;
			this.update();
		},
		deselectNode: function( id ) {
			if ( _nodes.hasOwnProperty(id) ) {
				delete _nodes[id];
				this.update();
			}
		},
		clearNodes: function( update ) {
			update = (update || update === undefined);
			
			for (var i in _nodes) {
				if ( _nodes.hasOwnProperty(i) ) {
					delete _nodes[i];
				}
			}
			if (update) {
				this.update();	
			}
		},
		getNodeSelection: function() {
			return _nodes;
		},
		getNodeQuery: function() {
			var selectors = [],
				i;
				
			for (i in _nodes) {
				if ( _nodes.hasOwnProperty(i) ) {
					selectors.push('#'+i);
				}
			}
			return selectors.join(',');
		},
		selectPolygon: function() {
			
		},
		update: function() {
			this.trigger(this.UPDATE);
		}
	});
	
	return new SelectionModel();
});