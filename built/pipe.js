//     pipe
//     (c) simonfan
//     pipe is licensed under the MIT terms.

define("__pipe/pump",["require","exports","module","lodash"],function(t,e){var i=t("lodash");e.pump=function(t,e){var s=this.maps.to,r=this.src,h=this.dest;t=t?i.pick(s,t):s;var c=e&&e.force;i.each(t,function(t,e){var s=this.srcGet(r,e);i.each(t,function(t){(c||!this.cacheCheck(e,s))&&this.destSet(h,t,s)},this)},this)}}),define("__pipe/drain",["require","exports","module","lodash"],function(t,e){var i=t("lodash");e.drain=function(){var t,e,s=arguments[0],r=arguments[1],h=this.maps.from;i.isArray(s)?(t=i.pick(h,s),e=r):i.isString(s)?(t={},t[s]=h[s],e=r):(t=h,e=s),e=e||{};{var c=e.force;this.src,this.dest}return i.each(t,function(t,e){var i=this.destGet(this.dest,t[0]);(c||!this.cacheCheck(e,i))&&this.srcSet(this.src,e,i)},this),this}}),define("__pipe/inject",["require","exports","module","lodash"],function(t,e){var i=t("lodash");e.inject=function(t,e){if(!this.src)throw new Error("No src for pipe");i.each(t,function(t,i){(!this.cacheCheck(i,t)||e&&e.force)&&this.srcSet(this.src,i,t)},this),this.pump(null,{force:!0})}}),define("__pipe/map",["require","exports","module","lodash"],function(t,e){function i(t,e,i){var r=i&&i.direction?i.direction:"both";e=s.isArray(e)?e:[e],r&&"both"!==r?this.maps[r][t]=e:(this.maps.to[t]=e,this.maps.from[t]=e)}var s=t("lodash");e.map=function(){var t=s.toArray(arguments);if(s.isString(arguments[0]))i.apply(this,t);else if(s.isObject(arguments[0])){var e=arguments[1];s.each(arguments[0],function(t,s){i.call(this,s,t,e)},this)}return this},e.unmap=function(t){return s.each(this.maps,function(e){delete e[t]}),this}}),define("__pipe/cache",["require","exports","module"],function(t,e){e.cacheClear=function(){return this.cache={},this},e.cacheCheck=function(t,e){return this.cache?this.cache[t]!==e?(this.cache[t]=e,!1):!0:!1}}),define("pipe",["require","exports","module","subject","lodash","./__pipe/pump","./__pipe/drain","./__pipe/inject","./__pipe/map","./__pipe/cache"],function(t,e,i){var s=t("subject"),r=(t("lodash"),i.exports=s({initialize:function(t,e,i,s){s=s||{},this.srcGet=this.srcGet||this.get,this.srcSet=this.srcSet||this.set,this.destGet=this.destGet||this.get,this.destSet=this.destSet||this.set,s.cache!==!1&&this.cacheClear(),this.maps={from:{},to:{}},t&&this.from(t),e&&this.to(e),i&&this.map(i,s)},get:function(t,e){return t[e]},set:function(t,e,i){return t[e]=i,t},from:function(t){return this.cacheClear(),this.src=t,this},to:function(t){return this.cacheClear(),this.dest=t,this}}));r.assignProto(t("./__pipe/pump")).assignProto(t("./__pipe/drain")).assignProto(t("./__pipe/inject")).assignProto(t("./__pipe/map")).assignProto(t("./__pipe/cache"))});