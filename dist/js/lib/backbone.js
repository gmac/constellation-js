// (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org

define(["./underscore","./jquery"],function(e,t){var n,r;return n=r={},function(){var e=this,t=e.Backbone,n=[],i=n.push,s=n.slice,o=n.splice,u;typeof r!="undefined"?u=r:u=e.Backbone={},u.VERSION="1.0.0";var a=e._;!a&&typeof require!="undefined"&&(a=require("underscore")),u.$=e.jQuery||e.Zepto||e.ender||e.$,u.noConflict=function(){return e.Backbone=t,this},u.emulateHTTP=!1,u.emulateJSON=!1;var f=u.Events={on:function(e,t,n){if(!c(this,"on",e,[t,n])||!t)return this;this._events||(this._events={});var r=this._events[e]||(this._events[e]=[]);return r.push({callback:t,context:n,ctx:n||this}),this},once:function(e,t,n){if(!c(this,"once",e,[t,n])||!t)return this;var r=this,i=a.once(function(){r.off(e,i),t.apply(this,arguments)});return i._callback=t,this.on(e,i,n)},off:function(e,t,n){var r,i,s,o,u,f,l,h;if(!this._events||!c(this,"off",e,[t,n]))return this;if(!e&&!t&&!n)return this._events={},this;o=e?[e]:a.keys(this._events);for(u=0,f=o.length;u<f;u++){e=o[u];if(s=this._events[e]){this._events[e]=r=[];if(t||n)for(l=0,h=s.length;l<h;l++)i=s[l],(t&&t!==i.callback&&t!==i.callback._callback||n&&n!==i.context)&&r.push(i);r.length||delete this._events[e]}}return this},trigger:function(e){if(!this._events)return this;var t=s.call(arguments,1);if(!c(this,"trigger",e,t))return this;var n=this._events[e],r=this._events.all;return n&&h(n,t),r&&h(r,arguments),this},stopListening:function(e,t,n){var r=this._listeners;if(!r)return this;var i=!t&&!n;typeof t=="object"&&(n=this),e&&((r={})[e._listenerId]=e);for(var s in r)r[s].off(t,n,this),i&&delete this._listeners[s];return this}},l=/\s+/,c=function(e,t,n,r){if(!n)return!0;if(typeof n=="object"){for(var i in n)e[t].apply(e,[i,n[i]].concat(r));return!1}if(l.test(n)){var s=n.split(l);for(var o=0,u=s.length;o<u;o++)e[t].apply(e,[s[o]].concat(r));return!1}return!0},h=function(e,t){var n,r=-1,i=e.length,s=t[0],o=t[1],u=t[2];switch(t.length){case 0:while(++r<i)(n=e[r]).callback.call(n.ctx);return;case 1:while(++r<i)(n=e[r]).callback.call(n.ctx,s);return;case 2:while(++r<i)(n=e[r]).callback.call(n.ctx,s,o);return;case 3:while(++r<i)(n=e[r]).callback.call(n.ctx,s,o,u);return;default:while(++r<i)(n=e[r]).callback.apply(n.ctx,t)}},p={listenTo:"on",listenToOnce:"once"};a.each(p,function(e,t){f[t]=function(t,n,r){var i=this._listeners||(this._listeners={}),s=t._listenerId||(t._listenerId=a.uniqueId("l"));return i[s]=t,typeof n=="object"&&(r=this),t[e](n,r,this),this}}),f.bind=f.on,f.unbind=f.off,a.extend(u,f);var d=u.Model=function(e,t){var n,r=e||{};t||(t={}),this.cid=a.uniqueId("c"),this.attributes={},a.extend(this,a.pick(t,v)),t.parse&&(r=this.parse(r,t)||{});if(n=a.result(this,"defaults"))r=a.defaults({},r,n);this.set(r,t),this.changed={},this.initialize.apply(this,arguments)},v=["url","urlRoot","collection"];a.extend(d.prototype,f,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(e){return a.clone(this.attributes)},sync:function(){return u.sync.apply(this,arguments)},get:function(e){return this.attributes[e]},escape:function(e){return a.escape(this.get(e))},has:function(e){return this.get(e)!=null},set:function(e,t,n){var r,i,s,o,u,f,l,c;if(e==null)return this;typeof e=="object"?(i=e,n=t):(i={})[e]=t,n||(n={});if(!this._validate(i,n))return!1;s=n.unset,u=n.silent,o=[],f=this._changing,this._changing=!0,f||(this._previousAttributes=a.clone(this.attributes),this.changed={}),c=this.attributes,l=this._previousAttributes,this.idAttribute in i&&(this.id=i[this.idAttribute]);for(r in i)t=i[r],a.isEqual(c[r],t)||o.push(r),a.isEqual(l[r],t)?delete this.changed[r]:this.changed[r]=t,s?delete c[r]:c[r]=t;if(!u){o.length&&(this._pending=!0);for(var h=0,p=o.length;h<p;h++)this.trigger("change:"+o[h],this,c[o[h]],n)}if(f)return this;if(!u)while(this._pending)this._pending=!1,this.trigger("change",this,n);return this._pending=!1,this._changing=!1,this},unset:function(e,t){return this.set(e,void 0,a.extend({},t,{unset:!0}))},clear:function(e){var t={};for(var n in this.attributes)t[n]=void 0;return this.set(t,a.extend({},e,{unset:!0}))},hasChanged:function(e){return e==null?!a.isEmpty(this.changed):a.has(this.changed,e)},changedAttributes:function(e){if(!e)return this.hasChanged()?a.clone(this.changed):!1;var t,n=!1,r=this._changing?this._previousAttributes:this.attributes;for(var i in e){if(a.isEqual(r[i],t=e[i]))continue;(n||(n={}))[i]=t}return n},previous:function(e){return e==null||!this._previousAttributes?null:this._previousAttributes[e]},previousAttributes:function(){return a.clone(this._previousAttributes)},fetch:function(e){e=e?a.clone(e):{},e.parse===void 0&&(e.parse=!0);var t=this,n=e.success;return e.success=function(r){if(!t.set(t.parse(r,e),e))return!1;n&&n(t,r,e),t.trigger("sync",t,r,e)},F(this,e),this.sync("read",this,e)},save:function(e,t,n){var r,i,s,o=this.attributes;e==null||typeof e=="object"?(r=e,n=t):(r={})[e]=t;if(r&&(!n||!n.wait)&&!this.set(r,n))return!1;n=a.extend({validate:!0},n);if(!this._validate(r,n))return!1;r&&n.wait&&(this.attributes=a.extend({},o,r)),n.parse===void 0&&(n.parse=!0);var u=this,f=n.success;return n.success=function(e){u.attributes=o;var t=u.parse(e,n);n.wait&&(t=a.extend(r||{},t));if(a.isObject(t)&&!u.set(t,n))return!1;f&&f(u,e,n),u.trigger("sync",u,e,n)},F(this,n),i=this.isNew()?"create":n.patch?"patch":"update",i==="patch"&&(n.attrs=r),s=this.sync(i,this,n),r&&n.wait&&(this.attributes=o),s},destroy:function(e){e=e?a.clone(e):{};var t=this,n=e.success,r=function(){t.trigger("destroy",t,t.collection,e)};e.success=function(i){(e.wait||t.isNew())&&r(),n&&n(t,i,e),t.isNew()||t.trigger("sync",t,i,e)};if(this.isNew())return e.success(),!1;F(this,e);var i=this.sync("delete",this,e);return e.wait||r(),i},url:function(){var e=a.result(this,"urlRoot")||a.result(this.collection,"url")||j();return this.isNew()?e:e+(e.charAt(e.length-1)==="/"?"":"/")+encodeURIComponent(this.id)},parse:function(e,t){return e},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},isValid:function(e){return this._validate({},a.extend(e||{},{validate:!0}))},_validate:function(e,t){if(!t.validate||!this.validate)return!0;e=a.extend({},this.attributes,e);var n=this.validationError=this.validate(e,t)||null;return n?(this.trigger("invalid",this,n,a.extend(t||{},{validationError:n})),!1):!0}});var m=["keys","values","pairs","invert","pick","omit"];a.each(m,function(e){d.prototype[e]=function(){var t=s.call(arguments);return t.unshift(this.attributes),a[e].apply(a,t)}});var g=u.Collection=function(e,t){t||(t={}),t.url&&(this.url=t.url),t.model&&(this.model=t.model),t.comparator!==void 0&&(this.comparator=t.comparator),this._reset(),this.initialize.apply(this,arguments),e&&this.reset(e,a.extend({silent:!0},t))},y={add:!0,remove:!0,merge:!0},b={add:!0,merge:!1,remove:!1};a.extend(g.prototype,f,{model:d,initialize:function(){},toJSON:function(e){return this.map(function(t){return t.toJSON(e)})},sync:function(){return u.sync.apply(this,arguments)},add:function(e,t){return this.set(e,a.defaults(t||{},b))},remove:function(e,t){e=a.isArray(e)?e.slice():[e],t||(t={});var n,r,i,s;for(n=0,r=e.length;n<r;n++){s=this.get(e[n]);if(!s)continue;delete this._byId[s.id],delete this._byId[s.cid],i=this.indexOf(s),this.models.splice(i,1),this.length--,t.silent||(t.index=i,s.trigger("remove",s,this,t)),this._removeReference(s)}return this},set:function(e,t){t=a.defaults(t||{},y),t.parse&&(e=this.parse(e,t)),a.isArray(e)||(e=e?[e]:[]);var n,r,s,u,f,l,c=t.at,h=this.comparator&&c==null&&t.sort!==!1,p=a.isString(this.comparator)?this.comparator:null,d=[],v=[],m={};for(n=0,r=e.length;n<r;n++){if(!(s=this._prepareModel(e[n],t)))continue;(f=this.get(s))?(t.remove&&(m[f.cid]=!0),t.merge&&(f.set(s.attributes,t),h&&!l&&f.hasChanged(p)&&(l=!0))):t.add&&(d.push(s),s.on("all",this._onModelEvent,this),this._byId[s.cid]=s,s.id!=null&&(this._byId[s.id]=s))}if(t.remove){for(n=0,r=this.length;n<r;++n)m[(s=this.models[n]).cid]||v.push(s);v.length&&this.remove(v,t)}d.length&&(h&&(l=!0),this.length+=d.length,c!=null?o.apply(this.models,[c,0].concat(d)):i.apply(this.models,d)),l&&this.sort({silent:!0});if(t.silent)return this;for(n=0,r=d.length;n<r;n++)(s=d[n]).trigger("add",s,this,t);return l&&this.trigger("sort",this,t),this},reset:function(e,t){t||(t={});for(var n=0,r=this.models.length;n<r;n++)this._removeReference(this.models[n]);return t.previousModels=this.models,this._reset(),this.add(e,a.extend({silent:!0},t)),t.silent||this.trigger("reset",this,t),this},push:function(e,t){return e=this._prepareModel(e,t),this.add(e,a.extend({at:this.length},t)),e},pop:function(e){var t=this.at(this.length-1);return this.remove(t,e),t},unshift:function(e,t){return e=this._prepareModel(e,t),this.add(e,a.extend({at:0},t)),e},shift:function(e){var t=this.at(0);return this.remove(t,e),t},slice:function(e,t){return this.models.slice(e,t)},get:function(e){return e==null?void 0:this._byId[e.id!=null?e.id:e.cid||e]},at:function(e){return this.models[e]},where:function(e,t){return a.isEmpty(e)?t?void 0:[]:this[t?"find":"filter"](function(t){for(var n in e)if(e[n]!==t.get(n))return!1;return!0})},findWhere:function(e){return this.where(e,!0)},sort:function(e){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");return e||(e={}),a.isString(this.comparator)||this.comparator.length===1?this.models=this.sortBy(this.comparator,this):this.models.sort(a.bind(this.comparator,this)),e.silent||this.trigger("sort",this,e),this},sortedIndex:function(e,t,n){t||(t=this.comparator);var r=a.isFunction(t)?t:function(e){return e.get(t)};return a.sortedIndex(this.models,e,r,n)},pluck:function(e){return a.invoke(this.models,"get",e)},fetch:function(e){e=e?a.clone(e):{},e.parse===void 0&&(e.parse=!0);var t=e.success,n=this;return e.success=function(r){var i=e.reset?"reset":"set";n[i](r,e),t&&t(n,r,e),n.trigger("sync",n,r,e)},F(this,e),this.sync("read",this,e)},create:function(e,t){t=t?a.clone(t):{};if(!(e=this._prepareModel(e,t)))return!1;t.wait||this.add(e,t);var n=this,r=t.success;return t.success=function(i){t.wait&&n.add(e,t),r&&r(e,i,t)},e.save(null,t),e},parse:function(e,t){return e},clone:function(){return new this.constructor(this.models)},_reset:function(){this.length=0,this.models=[],this._byId={}},_prepareModel:function(e,t){if(e instanceof d)return e.collection||(e.collection=this),e;t||(t={}),t.collection=this;var n=new this.model(e,t);return n._validate(e,t)?n:(this.trigger("invalid",this,e,t),!1)},_removeReference:function(e){this===e.collection&&delete e.collection,e.off("all",this._onModelEvent,this)},_onModelEvent:function(e,t,n,r){if((e==="add"||e==="remove")&&n!==this)return;e==="destroy"&&this.remove(t,r),t&&e==="change:"+t.idAttribute&&(delete this._byId[t.previous(t.idAttribute)],t.id!=null&&(this._byId[t.id]=t)),this.trigger.apply(this,arguments)}});var w=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","indexOf","shuffle","lastIndexOf","isEmpty","chain"];a.each(w,function(e){g.prototype[e]=function(){var t=s.call(arguments);return t.unshift(this.models),a[e].apply(a,t)}});var E=["groupBy","countBy","sortBy"];a.each(E,function(e){g.prototype[e]=function(t,n){var r=a.isFunction(t)?t:function(e){return e.get(t)};return a[e](this.models,r,n)}});var S=u.View=function(e){this.cid=a.uniqueId("view"),this._configure(e||{}),this._ensureElement(),this.initialize.apply(this,arguments),this.delegateEvents()},x=/^(\S+)\s*(.*)$/,T=["model","collection","el","id","attributes","className","tagName","events"];a.extend(S.prototype,f,{tagName:"div",$:function(e){return this.$el.find(e)},initialize:function(){},render:function(){return this},remove:function(){return this.$el.remove(),this.stopListening(),this},setElement:function(e,t){return this.$el&&this.undelegateEvents(),this.$el=e instanceof u.$?e:u.$(e),this.el=this.$el[0],t!==!1&&this.delegateEvents(),this},delegateEvents:function(e){if(!e&&!(e=a.result(this,"events")))return this;this.undelegateEvents();for(var t in e){var n=e[t];a.isFunction(n)||(n=this[e[t]]);if(!n)continue;var r=t.match(x),i=r[1],s=r[2];n=a.bind(n,this),i+=".delegateEvents"+this.cid,s===""?this.$el.on(i,n):this.$el.on(i,s,n)}return this},undelegateEvents:function(){return this.$el.off(".delegateEvents"+this.cid),this},_configure:function(e){this.options&&(e=a.extend({},a.result(this,"options"),e)),a.extend(this,a.pick(e,T)),this.options=e},_ensureElement:function(){if(!this.el){var e=a.extend({},a.result(this,"attributes"));this.id&&(e.id=a.result(this,"id")),this.className&&(e["class"]=a.result(this,"className"));var t=u.$("<"+a.result(this,"tagName")+">").attr(e);this.setElement(t,!1)}else this.setElement(a.result(this,"el"),!1)}}),u.sync=function(e,t,n){var r=N[e];a.defaults(n||(n={}),{emulateHTTP:u.emulateHTTP,emulateJSON:u.emulateJSON});var i={type:r,dataType:"json"};n.url||(i.url=a.result(t,"url")||j()),n.data==null&&t&&(e==="create"||e==="update"||e==="patch")&&(i.contentType="application/json",i.data=JSON.stringify(n.attrs||t.toJSON(n))),n.emulateJSON&&(i.contentType="application/x-www-form-urlencoded",i.data=i.data?{model:i.data}:{});if(n.emulateHTTP&&(r==="PUT"||r==="DELETE"||r==="PATCH")){i.type="POST",n.emulateJSON&&(i.data._method=r);var s=n.beforeSend;n.beforeSend=function(e){e.setRequestHeader("X-HTTP-Method-Override",r);if(s)return s.apply(this,arguments)}}i.type!=="GET"&&!n.emulateJSON&&(i.processData=!1),i.type==="PATCH"&&window.ActiveXObject&&(!window.external||!window.external.msActiveXFilteringEnabled)&&(i.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")});var o=n.xhr=u.ajax(a.extend(i,n));return t.trigger("request",t,o,n),o};var N={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};u.ajax=function(){return u.$.ajax.apply(u.$,arguments)};var C=u.Router=function(e){e||(e={}),e.routes&&(this.routes=e.routes),this._bindRoutes(),this.initialize.apply(this,arguments)},k=/\((.*?)\)/g,L=/(\(\?)?:\w+/g,A=/\*\w+/g,O=/[\-{}\[\]+?.,\\\^$|#\s]/g;a.extend(C.prototype,f,{initialize:function(){},route:function(e,t,n){a.isRegExp(e)||(e=this._routeToRegExp(e)),a.isFunction(t)&&(n=t,t=""),n||(n=this[t]);var r=this;return u.history.route(e,function(i){var s=r._extractParameters(e,i);n&&n.apply(r,s),r.trigger.apply(r,["route:"+t].concat(s)),r.trigger("route",t,s),u.history.trigger("route",r,t,s)}),this},navigate:function(e,t){return u.history.navigate(e,t),this},_bindRoutes:function(){if(!this.routes)return;this.routes=a.result(this,"routes");var e,t=a.keys(this.routes);while((e=t.pop())!=null)this.route(e,this.routes[e])},_routeToRegExp:function(e){return e=e.replace(O,"\\$&").replace(k,"(?:$1)?").replace(L,function(e,t){return t?e:"([^/]+)"}).replace(A,"(.*?)"),new RegExp("^"+e+"$")},_extractParameters:function(e,t){var n=e.exec(t).slice(1);return a.map(n,function(e){return e?decodeURIComponent(e):null})}});var M=u.History=function(){this.handlers=[],a.bindAll(this,"checkUrl"),typeof window!="undefined"&&(this.location=window.location,this.history=window.history)},_=/^[#\/]|\s+$/g,D=/^\/+|\/+$/g,P=/msie [\w.]+/,H=/\/$/;M.started=!1,a.extend(M.prototype,f,{interval:50,getHash:function(e){var t=(e||this).location.href.match(/#(.*)$/);return t?t[1]:""},getFragment:function(e,t){if(e==null)if(this._hasPushState||!this._wantsHashChange||t){e=this.location.pathname;var n=this.root.replace(H,"");e.indexOf(n)||(e=e.substr(n.length))}else e=this.getHash();return e.replace(_,"")},start:function(e){if(M.started)throw new Error("Backbone.history has already been started");M.started=!0,this.options=a.extend({},{root:"/"},this.options,e),this.root=this.options.root,this._wantsHashChange=this.options.hashChange!==!1,this._wantsPushState=!!this.options.pushState,this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState);var t=this.getFragment(),n=document.documentMode,r=P.exec(navigator.userAgent.toLowerCase())&&(!n||n<=7);this.root=("/"+this.root+"/").replace(D,"/"),r&&this._wantsHashChange&&(this.iframe=u.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(t)),this._hasPushState?u.$(window).on("popstate",this.checkUrl):this._wantsHashChange&&"onhashchange"in window&&!r?u.$(window).on("hashchange",this.checkUrl):this._wantsHashChange&&(this._checkUrlInterval=setInterval(this.checkUrl,this.interval)),this.fragment=t;var i=this.location,s=i.pathname.replace(/[^\/]$/,"$&/")===this.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!s)return this.fragment=this.getFragment(null,!0),this.location.replace(this.root+this.location.search+"#"+this.fragment),!0;this._wantsPushState&&this._hasPushState&&s&&i.hash&&(this.fragment=this.getHash().replace(_,""),this.history.replaceState({},document.title,this.root+this.fragment+i.search));if(!this.options.silent)return this.loadUrl()},stop:function(){u.$(window).off("popstate",this.checkUrl).off("hashchange",this.checkUrl),clearInterval(this._checkUrlInterval),M.started=!1},route:function(e,t){this.handlers.unshift({route:e,callback:t})},checkUrl:function(e){var t=this.getFragment();t===this.fragment&&this.iframe&&(t=this.getFragment(this.getHash(this.iframe)));if(t===this.fragment)return!1;this.iframe&&this.navigate(t),this.loadUrl()||this.loadUrl(this.getHash())},loadUrl:function(e){var t=this.fragment=this.getFragment(e),n=a.any(this.handlers,function(e){if(e.route.test(t))return e.callback(t),!0});return n},navigate:function(e,t){if(!M.started)return!1;if(!t||t===!0)t={trigger:t};e=this.getFragment(e||"");if(this.fragment===e)return;this.fragment=e;var n=this.root+e;if(this._hasPushState)this.history[t.replace?"replaceState":"pushState"]({},document.title,n);else{if(!this._wantsHashChange)return this.location.assign(n);this._updateHash(this.location,e,t.replace),this.iframe&&e!==this.getFragment(this.getHash(this.iframe))&&(t.replace||this.iframe.document.open().close(),this._updateHash(this.iframe.location,e,t.replace))}t.trigger&&this.loadUrl(e)},_updateHash:function(e,t,n){if(n){var r=e.href.replace(/(javascript:|#).*$/,"");e.replace(r+"#"+t)}else e.hash="#"+t}}),u.history=new M;var B=function(e,t){var n=this,r;e&&a.has(e,"constructor")?r=e.constructor:r=function(){return n.apply(this,arguments)},a.extend(r,n,t);var i=function(){this.constructor=r};return i.prototype=n.prototype,r.prototype=new i,e&&a.extend(r.prototype,e),r.__super__=n.prototype,r};d.extend=g.extend=C.extend=S.extend=M.extend=B;var j=function(){throw new Error('A "url" property or function must be specified')},F=function(e,t){var n=t.error;t.error=function(r){n&&n(e,r,t),e.trigger("error",e,r,t)}}}.call(this),function(e,t,n){function r(){return((1+Math.random())*65536|0).toString(16).substring(1)}function i(){return r()+r()+"-"+r()+"-"+r()+"-"+r()+"-"+r()+r()+r()}e.LocalStorage=window.Store=function(e){this.name=e;var t=this.localStorage().getItem(this.name);this.records=t&&t.split(",")||[]},t.extend(e.LocalStorage.prototype,{save:function(){this.localStorage().setItem(this.name,this.records.join(","))},create:function(e){return e.id||(e.id=i(),e.set(e.idAttribute,e.id)),this.localStorage().setItem(this.name+"-"+e.id,JSON.stringify(e)),this.records.push(e.id.toString()),this.save(),e.toJSON()},update:function(e){return this.localStorage().setItem(this.name+"-"+e.id,JSON.stringify(e)),t.include(this.records,e.id.toString())||this.records.push(e.id.toString()),this.save(),e.toJSON()},find:function(e){return JSON.parse(this.localStorage().getItem(this.name+"-"+e.id))},findAll:function(){return t(this.records).chain().map(function(e){return JSON.parse(this.localStorage().getItem(this.name+"-"+e))},this).compact().value()},destroy:function(e){return this.localStorage().removeItem(this.name+"-"+e.id),this.records=t.reject(this.records,function(t){return t==e.id.toString()}),this.save(),e},localStorage:function(){return localStorage}}),e.LocalStorage.sync=window.Store.sync=e.localSync=function(e,t,r,i){var s=t.localStorage||t.collection.localStorage;typeof r=="function"&&(r={success:r,error:i});var o,u=n.Deferred&&n.Deferred();switch(e){case"read":o=t.id!=undefined?s.find(t):s.findAll();break;case"create":o=s.create(t);break;case"update":o=s.update(t);break;case"delete":o=s.destroy(t)}return o?(r.success(o),u&&u.resolve()):(r.error("Record not found"),u&&u.reject()),u&&u.promise()},e.ajaxSync=e.sync,e.getSyncMethod=function(t){return t.localStorage||t.collection&&t.collection.localStorage?e.localSync:e.ajaxSync},e.sync=function(t,n,r,i){return e.getSyncMethod(n).apply(this,[t,n,r,i])}}(n,e,t),r});