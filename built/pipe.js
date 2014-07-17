//     pipe
//     (c) simonfan
//     pipe is licensed under the MIT terms.

define("__pipe/pump",["require","exports","module","lodash"],function(t,i){var e=t("lodash");i.pump=function(t,i){var s=this.maps.to,r=this.src,h=this.dest;t=t?e.pick(s,t):s,e.each(t,function(t,s){var n=this._srcGet(r,s);(!this.isCached(s,n)||i)&&e.each(t,function(t){return this._destSet(h,t,n)},this)},this)}}),define("__pipe/drain",["require","exports","module","lodash"],function(t,i){var e=t("lodash");i.drain=function(t,i){{var s=this.maps.from;this.src,this.dest}return t=t?e.pick(s,t):s,e.each(t,function(t,e){var s=this._destGet(this.dest,t[0]);(!this.isCached(e,s)||i)&&this._srcSet(this.src,e,s)},this),this}}),define("__pipe/inject",["require","exports","module","lodash"],function(t,i){var e=t("lodash");i.inject=function(t,i){if(!this.src)throw new Error("No src for pipe");e.each(t,function(t,e){(!this.isCached(e,t)||i)&&this._srcSet(this.src,e,t)},this),this.pump(null,!0)}}),define("__pipe/map",["require","exports","module","lodash"],function(t,i){function e(t,i,e){i=s.isArray(i)?i:[i],e&&"both"!==e?this.maps[e][t]=i:(this.maps.to[t]=i,this.maps.from[t]=i)}var s=t("lodash");i.map=function(){if(s.isString(arguments[0]))e.apply(this,arguments);else if(s.isObject(arguments[0])){var t=arguments[1];s.each(arguments[0],function(i,r){var h;s.isString(i)?h=i:(h=i.dest,t=i.direction||t),e.call(this,r,h,t)},this)}return this},i.unmap=function(t){return s.each(this.maps,function(i){delete i[t]}),this}}),define("__pipe/cache",["require","exports","module"],function(t,i){i.clearCache=function(){return this.cache={},this},i.isCached=function(t,i){return this.cache?this.cache[t]!==i?(this.cache[t]=i,!1):!0:!1}}),define("pipe",["require","exports","module","subject","lodash","./__pipe/pump","./__pipe/drain","./__pipe/inject","./__pipe/map","./__pipe/cache"],function(t,i,e){var s=t("subject"),r=t("lodash"),h=["get","set","srcGet","srcSet","destGet","destSet"],n=e.exports=s({initialize:function(t,i){i=i||{},r.each(h,function(t){this[t]=i[t]||this[t]},this),this._srcGet=this.srcGet||this.get,this._srcSet=this.srcSet||this.set,this._destGet=this.destGet||this.get,this._destSet=this.destSet||this.set,i.cache!==!1&&this.clearCache(),i.from&&this.from(i.from),i.to&&this.to(i.to),this.maps={from:{},to:{}},this.map(t)},get:function(t,i){return t[i]},set:function(t,i,e){return t[i]=e,t},from:function(t){return this.clearCache(),this.src=t,this},to:function(t){return this.clearCache(),this.dest=t,this}});n.assignProto(t("./__pipe/pump")).assignProto(t("./__pipe/drain")).assignProto(t("./__pipe/inject")).assignProto(t("./__pipe/map")).assignProto(t("./__pipe/cache"))});