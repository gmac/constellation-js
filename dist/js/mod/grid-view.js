define(["lib/jquery","lib/underscore","lib/backbone","mod/grid-model","mod/grid-selection-model","mod/service-window"],function(e,t,n,r,i,s){var o=n.View.extend({el:"#grid",model:r,viewSelection:[],events:{mousedown:"onTouch"},initialize:function(){var n=this;n.tmpl=t.template(e("#grid-view").html()),r.on(r.events.CHANGE,n.render,n),r.on(r.events.CHANGE,n.setFrame,n),s.on(s.RESIZE,n.setFrame,n),i.on(i.UPDATE,n.setSelection,n),n.setFrame()},getPolygonPath:function(e){var n="";return t.each(e.nodes,function(e,t){var i=r.getNodeById(e);i&&(n+=(t<=0?"M":"L")+i.x+" "+i.y+" ")}),n+"Z"},render:function(){var e=this,n={},i={},s=r.nodes,o,u;t.each(r.polys,function(t,n){i[t.id]={id:t.id,nodes:t.nodes.join(" "),d:e.getPolygonPath(t)}}),t.each(s,function(e,t){for(u in e.to)e.to.hasOwnProperty(u)&&s.hasOwnProperty(u)&&(o=s[u],n.hasOwnProperty(o.id+" "+e.id)||(n[e.id+" "+o.id]={id:e.id+" "+o.id,x1:e.x,y1:e.y,x2:o.x,y2:o.y}))}),this.$el.html(this.tmpl({nodes:s,lines:n,polys:i})),this.setSelection()},setFrame:function(){var e=r.get("width"),t=r.get("height"),n=e?"auto":10,i=45;this.$el.width(e).css({marginLeft:n,marginRight:n}),n=t?(s.height-i-t)/2:10,t=t?t:s.height-i-n*2,this.$el.height(t).css({marginTop:i+n})},setSelection:function(){var n=this;t.each(this.viewSelection,function(t){t=e(t),t.is("path")?t[0].setAttribute("class",t[0].getAttribute("class").replace(/[\s]?select/g,"")):t.removeClass("select").children(":first-child").text("")}),this.viewSelection.length=0,t.each(i.items,function(e,t){item=n.$el.find("#"+e),item.is("path")?item[0].setAttribute("class",item[0].getAttribute("class")+" select"):item.addClass("select").children(":first-child").text(t+1),n.viewSelection.push(item[0])})},localizeEventOffset:function(e){var t=this.$el.offset();return t.left=e.pageX-t.left,t.top=e.pageY-t.top,t},dragNode:function(t,n){var i=this,s=r.getNodeById(t),o=i.$el.find("line."+t),u=i.$el.find("path."+t),a=Math.min,f=Math.max,l=r.get("width")||i.$el.width(),c=r.get("height")||i.$el.height();e(document).on("mouseup",function(){e(document).off("mouseup mousemove"),s=n=o=u=a=f=null}).on("mousemove",function(e){var h=i.localizeEventOffset(e),p=new RegExp(t+"$|"+t+"\\s|\\s","g"),d;return n.css({left:s.x=f(0,a(h.left,l)),top:s.y=f(0,a(h.top,c))}),o.each(function(e,t){d=r.getNodeById(t.getAttribute("class").replace(p,"")),t.setAttribute("x1",s.x),t.setAttribute("y1",s.y),t.setAttribute("x2",d.x),t.setAttribute("y2",d.y)}),u.each(function(e,t){var n=r.getPolygonById(t.getAttribute("id"));t.setAttribute("d",i.getPolygonPath(n))}),!1})},dragPoly:function(e,t){},onTouch:function(t){var n=e(t.target),s;return n=n.is("li > span")?n.parent():n,s=n.attr("id"),t.shiftKey||i.deselectAll(!!s),n.is("li")?i.toggle(s)&&this.dragNode(s,n):n.is("path")?i.toggle(s)&&this.dragPoly(s,n):t.shiftKey&&(n=this.localizeEventOffset(t),s=r.addNode(n.left,n.top),i.select(s)),!1}});return new o})