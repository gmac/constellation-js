// Constellation.js 0.2.0
// (c) 2011-2013 Greg MacWilliam
// Freely distributed under the MIT license
// Docs: https://github.com/gmac/constellation.js

(function(e,t){var n=t(Math.sqrt,Math.min,Math.max,Math.abs);"undefined"!=typeof exports?module.exports=n:"function"==typeof define&&define.amd?define(n):e.Const=n})(this,function(e,t,n,r){function i(e){return e instanceof Array}function s(e){return"function"==typeof e}function o(e){return Array.prototype.slice.call(e)}var u={},a=u.utils={size:function(e){if(i(e))return e.length;var t=0;for(var n in e)e.hasOwnProperty(n)&&t++;return t},contains:function(e,t){if(i(e)){if(s(Array.prototype.indexOf))return e.indexOf(t)>=0;for(var n=e.length,r=0;n>r;)if(e[r++]===t)return!0}return e&&e.hasOwnProperty(t)},each:function(e,t,n){var r=0;if(i(e))for(var s=e.length;s>r;)t.call(n,e[r],r++);else for(r in e)e.hasOwnProperty(r)&&t.call(n,e[r],r);return e},map:function(e,t,n){var r=0;if(i(e))for(var s=e.length;s>r;)e[r]=t.call(n,e[r],r++);else for(r in e)e.hasOwnProperty(r)&&(e[r]=t.call(n,e[r],r));return e},all:function(e,t,n){for(var r=e.length,i=0;r>i;)if(!t.call(n,e[i],i++))return!1;return!0},toArray:function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(e[n]);return t}},f=u.Point=function(e,t){this.x=e||0,this.y=t||0},l=u.Rect=function(e,t,n,r){this.x=e||0,this.y=t||0,this.width=n||0,this.height=r||0};u.distance=function(t,n){var r=n.x-t.x,i=n.y-t.y;return e(r*r+i*i)},u.ccw=function(e,t,n,r){return r?(n.y-e.y)*(t.x-e.x)>(t.y-e.y)*(n.x-e.x):(n.y-e.y)*(t.x-e.x)>=(t.y-e.y)*(n.x-e.x)},u.intersect=function(e,t,n,r){return u.ccw(e,n,r)!==u.ccw(t,n,r)&&u.ccw(e,t,n)!==u.ccw(e,t,r)},u.getRectForPointRing=function(e){var r=e[0],i=r.x,s=r.x,o=r.y,u=r.y;return a.each(e,function(e){i=t(i,e.x),s=n(s,e.x),o=t(o,e.y),u=n(u,e.y)}),new l(i,o,s-i,u-o)},u.hitTestRect=function(e,r){var i=t(r.x,r.x+r.width),s=n(r.x,r.x+r.width),o=t(r.y,r.y+r.height),u=n(r.y,r.y+r.height);return e.x>=i&&e.y>=o&&s>=e.x&&u>=e.y},u.hitTestPointRing=function(e,n){for(var r,i,s=n.length,o=new f(0,e.y),u=0,a=0;s>a;)r=n[a],i=n[(a+1)%s],o.x=t(o.x,t(r.x,i.x)-1),u+=this.intersect(o,e,r,i)?1:0,a++;return u%2>0},u.snapPointToLineSegment=function(e,t,n){var r=e.x-t.x,i=e.y-t.y,s=n.x-t.x,o=n.y-t.y,u=s*s+o*o,a=r*s+i*o,l=a/u;return 0>l?new f(t.x,t.y):l>1?new f(n.x,n.y):new f(t.x+s*l,t.y+o*l)},u.getNearestPointToPoint=function(e,t){var n,i,s=null,o=0/0,a=t.length-1;for(t.sort(function(t,n){return t=r(e.x-t.x),n=r(e.x-n.x),n-t});a>=0&&(n=t[a--],o>r(e.x-n.x)||isNaN(o));)i=u.distance(e,n),(o>i||isNaN(o))&&(s=n,o=i);return s};var c=u.Node=function(e,t,n,r,i){this.id=e,this.x=t||0,this.y=n||0,this.to=i||{},this.data=r||null},h=u.Polygon=function(e,t,n){this.id=e,this.nodes=t.slice(),this.data=n||null},p=u.Path=function(e,t,n){this.nodes=e||[],this.weight=t||0,this.estimate=n||0};p.prototype={copy:function(e,t){return new p(this.nodes.slice(),e||this.weight,t||this.estimate)},last:function(){return this.nodes[this.nodes.length-1]},contains:function(e){return a.contains(e)},prioratize:function(e,t){return t.estimate-e.estimate},dispose:function(){this.nodes.length=0,this.nodes=null}};var d=u.Grid=function(e){this.reset(e)};return d.prototype={nodes:{},polys:{},_i:0,toJSON:function(){return{nodes:this.nodes,polys:this.polys,i:this._i}},reset:function(e){this.nodes={},this.polys={},this._i=0,e&&(e.i&&(this._i=e.i),a.each(e.nodes||{},function(e){this.nodes[e.id]=e},this),a.each(e.polys||{},function(e){this.polys[e.id]=e},this))},addNode:function(e,t,n){"object"==typeof e&&(n=e,e=0);var r=new c(n&&n.id||"n"+this._i++,e,t,n);return this.nodes[r.id]=r,r},getNodeById:function(e){return this.nodes.hasOwnProperty(e)?this.nodes[e]:null},getNodes:function(e,t){return(!i(e)||t)&&(e=o(arguments)),a.map(e.slice(),function(e){return this.getNodeById(e)},this)},getNumNodes:function(){return a.size(this.nodes)},hasNodes:function(e,t){return(!i(e)||t)&&(e=o(arguments)),a.all(e,function(e){return this.nodes.hasOwnProperty(e)},this)},joinNodes:function(e,t){(!i(e)||t)&&(e=o(arguments));var n=!1;return e.length>1&&this.hasNodes(e)&&a.each(e,function(t){for(var r=this.nodes[t],i=e.length,s=0;i>s;)t=e[s++],t!==r.id&&(r.to[t]=1,n=!0)},this),n},splitNodes:function(e,t){if((!i(e)||t)&&(e=o(arguments)),2>e.length)return this.detachNodes(e);var n=!1;return a.each(e,function(t){var r=this.nodes[t];if(r&&r.to)for(t in r.to)a.contains(e,t)&&(delete r.to[t],n=!0)},this),n},detachNodes:function(e,t){(!i(e)||t)&&(e=o(arguments));var n=!1;return a.each(e,function(e){var t,r,i=this.nodes[e];if(i&&i.to){for(r in i.to)delete i.to[r],t=this.nodes[r],t&&t.to&&delete t.to[e];n=!0}},this),n},removeNodes:function(e,t){(!i(e)||t)&&(e=o(arguments));var n=this.detachNodes(e);return a.each(e,function(e){var t,r;if(this.nodes.hasOwnProperty(e)){delete this.nodes[e];for(r in this.polys)t=this.polys[r],t&&a.contains(t.nodes,e)&&delete this.polys[r];n=!0}},this),n},addPolygon:function(e,t){if(e.length>=3&&this.hasNodes(e)){var n=new h("p"+this._i++,e,t);return this.polys[n.id]=n,n}return null},getPolygonById:function(e){return this.polys.hasOwnProperty(e)?this.polys[e]:null},getPolygons:function(e,t){return(!i(e)||t)&&(e=o(arguments)),a.map(e.slice(),function(e){return this.getPolygonById(e)},this)},getNodesForPolygon:function(e){return this.polys.hasOwnProperty(e)?a.map(this.polys[e].nodes.slice(),function(e){return this.nodes[e]},this):null},getNumPolygons:function(){return a.size(this.polys)},removePolygons:function(e,t){(!i(e)||t)&&(e=o(arguments));var n=!1;return a.each(e,function(e){this.polys.hasOwnProperty(e)&&(delete this.polys[e],n=!0)},this),n},findPath:function(e,t,n,r){var i,o,a,f,l,c,h,d=[],v={},m=this.getNodeById(e),g=this.getNodeById(t),y=0;for(s(n)||(n=u.distance),s(r)||(r=u.distance),d.push(new p([m],n(m,m)));d.length>0;){o=d.pop(),m=o.last();for(h in m.to)m.to.hasOwnProperty(h)&&(a=this.nodes[h],a&&!o.contains(a)&&(l=o.weight+n(m,a),(v[a.id]||l)>=l&&(v[a.id]=l,c=l+r(a,g),(!i||i.weight>c)&&(f=o.copy(l,c),f.nodes.push(a),a.id===g.id?(i&&i.dispose(),i=f):d.push(f),f=null))),a=null);o.dispose(),o=m=null,d.sort(p.prototype.prioratize),y++}return d=v=g=null,{valid:!!i,weight:i?i.weight:0,cycles:y,nodes:i?i.nodes:[]}},findPathWithFewestNodes:function(e,t){var n=function(){return 1};return this.findPath(e,t,n,n)},snapPointToGrid:function(e,t){var n=null,r=0/0,i=[],s={};return a.each(this.nodes,function(t,o){if(e.id!==o)for(var a in t.to)if(t.to.hasOwnProperty(a)&&!s.hasOwnProperty(a+" "+t.id)){var f=this.nodes[a],l=u.snapPointToLineSegment(e,t,f),c=u.distance(e,l);s[t.id+" "+f.id]=!0,(!n||r>c)&&(n=l,r=c,i[0]=t.id,i[1]=f.id)}},this),t?{point:n,offset:r,segment:i}:n||e},getNearestNodeToNode:function(e){var t=[],n=this.getNodeById(e);return n?(a.each(this.nodes,function(e){e.id!==n.id&&t.push(e)},this),u.getNearestPointToPoint(n,t)):null},getNearestNodeToPoint:function(e){return u.getNearestPointToPoint(e,a.toArray(this.nodes))},hitTestPointInPolygons:function(e){for(var t in this.polys)if(this.polys.hasOwnProperty(t)&&u.hitTestPointRing(e,this.getNodesForPolygon(t)))return!0;return!1},getPolygonHitsForPoint:function(e){var t=[];return a.each(this.polys,function(n,r){u.hitTestPointRing(e,this.getNodesForPolygon(r))&&t.push(n.id)},this),t},getNodesInPolygon:function(e){var t=[],n=this.getPolygonById(e),r=this.getNodesForPolygon(e),i=u.getRectForPointRing(r);return n&&a.each(this.nodes,function(e){(a.contains(n.nodes,e.id)||u.hitTestRect(e,i)&&u.hitTestPointRing(e,r))&&t.push(e.id)},this),t},getNodesInRect:function(e){var t=[];return a.each(this.nodes,function(n){u.hitTestRect(n,e)&&t.push(n.id)},this),t},bridgePoints:function(e,t,n){function r(e,t){var n,r=this.addNode(e.x,e.y);if(t.length)for(n in t){var i=this.getPolygonById(t[n]).nodes;for(var s in i)this.joinNodes(r.id,i[s])}else{var o=this.snapPointToGrid(e,!0);if(o.point){r.x=o.point.x,r.y=o.point.y;for(n in o.segment)this.joinNodes(r.id,o.segment[n])}}return r.id}var i=this.getPolygonHitsForPoint(e),s=this.getPolygonHitsForPoint(t);if(i.length&&s.length){for(var o=[],u=i.length-1;u>=0;)a.contains(s,i[u])&&o.push(i[u]),u--;if(o.length)return[e,n?this.snapPointToGrid(t):t]}var f=r.call(this,e,i),l=r.call(this,t,s),c=this.findPath(f,l);return this.removeNodes(f,l),c.valid?(c=c.nodes,c.unshift(e),c.push(t),c):[]}},u});